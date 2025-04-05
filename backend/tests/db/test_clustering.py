from uuid import UUID

import pytest
from tests.fixtures.supabase import MockSupabase

from server.api.memento.models import MementoWithCoordinates
from server.services.db.models.schema_public_latest import (
    RejectedRecommendations,
    RejectedRecommendationsInsert,
)
from server.services.db.queries.clustering import (
    create_rejected_collection,
    get_mementos_for_clustering,
    is_collection_rejected,
)


def test_get_mementos_for_clustering(mock_supabase: MockSupabase) -> None:
    """Test retrieving mementos with coordinates for a specific user ID."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    user_id = UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8")
    mock_memento_data = [
        {
            "user_id": str(user_id),
            "id": 1,
            "coordinates": {"lat": 37.7749, "long": -122.4194},
        },
        {
            "user_id": str(user_id),
            "id": 2,
            "coordinates": {"lat": 40.7128, "long": -74.0060},
        },
    ]
    mock_query_response.data = mock_memento_data

    # When
    result = get_mementos_for_clustering(user_id)

    # Then
    mock_supabase_client.table.assert_called_once_with("memento")
    mock_supabase_client.table().select.assert_called_once_with(
        "user_id, id, coordinates"
    )
    mock_supabase_client.table().select().eq.assert_called_once_with(
        "user_id", str(user_id)
    )
    mock_supabase_client.table().select().eq().neq.assert_called_once_with(
        "coordinates", None
    )

    assert len(result) == 2
    assert all(isinstance(item, MementoWithCoordinates) for item in result)
    assert result[0].id == 1
    assert result[0].coordinates.lat == 37.7749
    assert result[0].coordinates.long == -122.4194
    assert result[1].id == 2
    assert result[1].coordinates.lat == 40.7128
    assert result[1].coordinates.long == -74.0060


def test_create_rejected_collection(mock_supabase: MockSupabase) -> None:
    """Test creating a rejected collection in the database."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    user_id = UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8")
    memento_ids = [1, 2, 3]

    rejected_recommendation = RejectedRecommendationsInsert(
        memento_ids=memento_ids, user_id=user_id
    )

    expected_response = {
        "id": 1,
        "user_id": str(user_id),
        "memento_ids": memento_ids,
    }
    mock_query_response.data = [expected_response]

    # When
    result = create_rejected_collection(user_id, rejected_recommendation)

    # Then
    mock_supabase_client.table.assert_called_once_with("rejected_recommendations")
    mock_supabase_client.table().insert.assert_called_once()

    # Check the insert payload includes the correct data
    insert_payload = mock_supabase_client.table().insert.call_args[0][0]
    assert insert_payload["user_id"] == str(user_id)
    assert insert_payload["memento_ids"] == memento_ids

    assert isinstance(result, RejectedRecommendations)
    assert result.id == 1
    assert result.user_id == user_id
    assert result.memento_ids == memento_ids


def test_is_collection_rejected_true(mock_supabase: MockSupabase) -> None:
    """Test checking if a collection has been rejected (true case)."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    user_id = UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8")
    memento_ids = [1, 2, 3]

    # Return a non-empty response
    mock_query_response.data = [{"id": 1}]

    # When
    result = is_collection_rejected(user_id, memento_ids)

    # Then
    mock_supabase_client.table.assert_called_once_with("rejected_recommendations")
    mock_supabase_client.table().select.assert_called_once_with("id")

    pg_array = "{1,2,3}"
    filter_calls = [
        call[0] for call in mock_supabase_client.table().select().filter.call_args_list
    ]

    assert ("user_id", "eq", str(user_id)) in filter_calls
    assert ("memento_ids", "cs", pg_array) in filter_calls
    assert result is True


def test_is_collection_rejected_false(mock_supabase: MockSupabase) -> None:
    """Test checking if a collection has been rejected (false case)."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    user_id = UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8")
    memento_ids = [1, 2, 3]

    # Return an empty response
    mock_query_response.data = []

    # When
    result = is_collection_rejected(user_id, memento_ids)

    # Then
    mock_supabase_client.table.assert_called_once_with("rejected_recommendations")
    mock_supabase_client.table().select.assert_called_once_with("id")

    pg_array = "{1,2,3}"
    filter_calls = [
        call[0] for call in mock_supabase_client.table().select().filter.call_args_list
    ]

    assert ("user_id", "eq", str(user_id)) in filter_calls
    assert ("memento_ids", "cs", pg_array) in filter_calls
    assert result is False

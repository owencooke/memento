import uuid
from datetime import date
from unittest.mock import MagicMock, call

from tests.fixtures.supabase import MockSupabase

from server.api.memento.models import MementoFilterParams, NewMemento, UpdateMemento
from server.services.db.models.joins import MementoWithImages
from server.services.db.models.schema_public_latest import Memento
from server.services.db.queries.memento import (
    create_memento,
    db_delete_memento,
    get_image_labels,
    get_mementos,
    update_memento,
)


def test_create_memento(
    mock_supabase: MockSupabase,
    memento_data: dict,
    expected_memento_data: dict,
) -> None:
    """Test inserting a new memento record with the create_memento function."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    mock_memento = NewMemento(**memento_data)
    mock_query_response.data = [expected_memento_data]

    # When
    result = create_memento(mock_memento, memento_data["user_id"])

    # Then
    mock_supabase_client.table.assert_called_once_with("memento")
    mock_supabase_client.table().insert.assert_called_once()
    assert isinstance(result, Memento)
    assert result.id == expected_memento_data["id"]
    assert result.caption == expected_memento_data["caption"]
    assert result.user_id == memento_data["user_id"]
    assert result.date == mock_memento.date


def test_update_memento(
    mock_supabase: MockSupabase,
    memento_data: dict,
    expected_memento_data: dict,
) -> None:
    """Test inserting a new memento record with the create_memento function."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    mock_memento = UpdateMemento(**memento_data)
    mock_query_response.data = [expected_memento_data]

    # When
    result = update_memento(memento_data["id"], mock_memento)

    # Then
    mock_supabase_client.table.assert_called_once_with("memento")
    mock_supabase_client.table().update.assert_called_once()
    assert isinstance(result, Memento)
    assert result.id == expected_memento_data["id"]
    assert result.caption == expected_memento_data["caption"]
    assert result.user_id == mock_memento.user_id
    assert result.date == mock_memento.date


def test_db_delete_memento(
    mock_supabase: MockSupabase,
    expected_memento_data: dict,
) -> None:
    """Test deleting a memento from the DB."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    memento_id = expected_memento_data["id"]
    mock_query_response.data = [expected_memento_data]

    # When
    result = db_delete_memento(memento_id)

    # Then
    mock_supabase_client.table.assert_called_once_with("memento")
    mock_supabase_client.table().delete.assert_called_once()
    mock_supabase_client.table().delete().eq.assert_called_once_with("id", memento_id)
    assert isinstance(result, Memento)
    assert result.id == memento_id
    assert result.caption == expected_memento_data["caption"]


def test_get_mementos_no_filter(
    mock_supabase: MockSupabase,
    memento_with_images_data: dict,
) -> None:
    """Test getting mementos without any filters."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    user_id = uuid.UUID(memento_with_images_data["user_id"])
    mock_query_response.data = [memento_with_images_data]

    # When
    result = get_mementos(user_id, None)

    # Then
    mock_supabase_client.table.assert_called_once_with("memento")
    mock_supabase_client.table().select.assert_called_once_with(
        "*, images:image!inner(*)",
    )
    mock_supabase_client.table().select().eq.assert_called_once_with(
        "user_id",
        str(user_id),
    )
    assert len(result) == 1
    assert isinstance(result[0], MementoWithImages)
    assert result[0].id == memento_with_images_data["id"]
    assert result[0].caption == memento_with_images_data["caption"]
    assert len(result[0].images) == 1
    assert result[0].images[0].image_label == "Mountain View"  # Formatted by validator


def test_get_mementos_date_filter(
    mock_supabase: MockSupabase,
    multiple_mementos_with_images_data: list[dict],
) -> None:
    """Test getting mementos with date range filters."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    user_id = uuid.UUID(multiple_mementos_with_images_data[0]["user_id"])
    mock_query_response.data = multiple_mementos_with_images_data[
        :2
    ]  # First two mementos

    # Create filter with date range
    start_date = date(2023, 1, 1)
    end_date = date(2023, 2, 1)
    filter_params = MementoFilterParams(start_date=start_date, end_date=end_date)

    # When
    result = get_mementos(user_id, filter_params)

    # Then
    mock_supabase_client.table.assert_called_once_with("memento")
    mock_supabase_client.table().select().eq.assert_called_once_with(
        "user_id", str(user_id)
    )
    mock_supabase_client.table().select().eq().gte.assert_called_once_with(
        "date", start_date.isoformat()
    )
    mock_supabase_client.table().select().eq().gte().lte.assert_called_once_with(
        "date", end_date.isoformat()
    )

    assert len(result) == 2
    assert result[0].date == date(2023, 1, 1)
    assert result[1].date == date(2023, 1, 31)


def test_get_mementos_text_search(
    mock_supabase: MockSupabase,
    multiple_mementos_with_images_data: list[dict],
) -> None:
    """Test getting mementos with text search filter."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    user_id = uuid.UUID(multiple_mementos_with_images_data[0]["user_id"])
    mock_query_response.data = [
        multiple_mementos_with_images_data[0]
    ]  # Only the mountain memento

    # Create filter with text search
    filter_params = MementoFilterParams(text="mountain hiking")

    # When
    result = get_mementos(user_id, filter_params)

    # Then
    mock_supabase_client.table.assert_called_once_with("memento")
    mock_supabase_client.table().select().eq.assert_called_once_with(
        "user_id", str(user_id)
    )
    mock_supabase_client.table().select().eq().text_search.assert_called_once_with(
        "memento_searchable_content", "mountain:* & hiking:*"
    )

    assert len(result) == 1
    assert "Mountain" in result[0].caption


def test_get_mementos_image_label_filter(
    mock_supabase: MockSupabase,
    multiple_mementos_with_images_data: list[dict],
) -> None:
    """Test getting mementos with image label filter."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    user_id = uuid.UUID(multiple_mementos_with_images_data[0]["user_id"])
    mock_query_response.data = [
        multiple_mementos_with_images_data[1]
    ]  # Only the beach memento

    # Create filter with image label
    filter_params = MementoFilterParams(image_label="beach")

    # When
    result = get_mementos(user_id, filter_params)

    # Then
    calls = [call("user_id", str(user_id)), call("images.image_label", "beach")]
    mock_supabase_client.table.assert_called_once_with("memento")
    mock_supabase_client.table().select().eq.assert_has_calls(calls)

    assert len(result) == 1
    assert "Beach" in result[0].caption
    assert len(result[0].images) == 2
    assert any(img.image_label == "Beach" for img in result[0].images)


def test_get_mementos_bounding_box_filter_with_results(
    mock_supabase: MockSupabase,
    multiple_mementos_with_images_data: list[dict],
) -> None:
    """Test getting mementos with bounding box filter that returns results."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    user_id = uuid.UUID(multiple_mementos_with_images_data[0]["user_id"])

    # Set up RPC response for mementos_in_bounds
    rpc_response = MagicMock()
    rpc_response.data = [{"id": 1}, {"id": 3}]  # IDs 1 and 3 are within bounds
    mock_supabase_client.rpc().execute.return_value = rpc_response

    # Set filtered mementos response
    mock_query_response.data = [
        multiple_mementos_with_images_data[0],  # Mountain (id=1)
        multiple_mementos_with_images_data[2],  # City (id=3)
    ]

    # Create filter with bounding box coordinates
    filter_params = MementoFilterParams(
        min_lat=40.0, min_long=-90.0, max_lat=50.0, max_long=-70.0
    )

    # When
    result = get_mementos(user_id, filter_params)

    # Then
    calls = [
        call(),
        call(
            "mementos_in_bounds",
            {
                "min_lat": 40.0,
                "min_long": -90.0,
                "max_lat": 50.0,
                "max_long": -70.0,
            },
        ),
        call().execute(),
    ]
    mock_supabase_client.rpc.assert_has_calls(calls)
    mock_supabase_client.table().select().eq().in_.assert_called_once_with("id", [1, 3])

    assert len(result) == 2
    assert result[0].id == 1  # Mountain
    assert result[1].id == 3  # City


def test_get_mementos_bounding_box_filter_empty_results(
    mock_supabase: MockSupabase,
    multiple_mementos_with_images_data: list[dict],
) -> None:
    """Test getting mementos with bounding box filter that returns no results."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    user_id = uuid.UUID(multiple_mementos_with_images_data[0]["user_id"])

    # Set up RPC response for mementos_in_bounds - empty results
    rpc_response = MagicMock()
    rpc_response.data = []  # No IDs in bounds
    mock_supabase_client.rpc().execute.return_value = rpc_response

    # Create filter with bounding box coordinates (far away from any data)
    filter_params = MementoFilterParams(
        min_lat=0.0, min_long=0.0, max_lat=10.0, max_long=10.0
    )

    # When
    result = get_mementos(user_id, filter_params)

    # Then
    mock_supabase_client.rpc.assert_called_once()
    # The function should return early without querying
    mock_supabase_client.table().select().eq().in_.assert_not_called()

    assert len(result) == 0


def test_get_mementos_combined_filters(
    mock_supabase: MockSupabase,
    multiple_mementos_with_images_data: list[dict],
) -> None:
    """Test getting mementos with multiple combined filters."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    user_id = uuid.UUID(multiple_mementos_with_images_data[0]["user_id"])

    # Set up RPC response for mementos_in_bounds
    rpc_response = MagicMock()
    rpc_response.data = [{"id": 1}, {"id": 2}]  # IDs 1 and 2 are within bounds
    mock_supabase_client.rpc().execute.return_value = rpc_response

    # Set filtered mementos response - only Beach day
    mock_query_response.data = [multiple_mementos_with_images_data[1]]

    # Create filter with multiple filters
    filter_params = MementoFilterParams(
        start_date=date(2023, 1, 15),
        end_date=date(2023, 2, 15),
        text="beach sunny",
        min_lat=25.0,
        min_long=-90.0,
        max_lat=35.0,
        max_long=-80.0,
    )

    # When
    result = get_mementos(user_id, filter_params)

    # Then
    # Check that all filter methods were called
    mock_supabase_client.table().select().eq().gte.assert_called_once()
    mock_supabase_client.table().select().eq().gte().lte.assert_called_once()
    mock_supabase_client.table().select().eq().gte().lte().text_search.assert_called_once()
    mock_supabase_client.table().select().eq().gte().lte().text_search().in_.assert_called_once_with(
        "id", [1, 2]
    )

    assert len(result) == 1
    assert "Beach" in result[0].caption
    assert result[0].date == date(2023, 1, 31)


def test_get_image_labels(
    mock_supabase: MockSupabase,
    multiple_mementos_with_images_data: list[dict],
) -> None:
    """Test getting all image labels for a user."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    user_id = uuid.UUID(multiple_mementos_with_images_data[0]["user_id"])

    # Prepare response data in the format returned by Supabase
    response_data = [
        {"user_id": user_id, "images": [{"image_label": "mountain_view"}]},
        {
            "user_id": user_id,
            "images": [{"image_label": "beach"}, {"image_label": "sunset"}],
        },
        {"user_id": user_id, "images": [{"image_label": "cityscape"}]},
    ]
    mock_query_response.data = response_data

    # When
    result = get_image_labels(user_id)

    # Then
    calls = [call("image.image_label", None), call("image.image_label", "")]
    mock_supabase_client.table.assert_called_once_with("memento")
    mock_supabase_client.table().select.assert_called_once_with(
        "user_id, images:image(image_label)"
    )
    mock_supabase_client.table().select().eq.assert_called_once_with(
        "user_id", str(user_id)
    )
    mock_supabase_client.table().select().eq().neq.assert_has_calls(calls)

    # Check that all labels are returned in alphabetical order
    assert result == ["beach", "cityscape", "mountain_view", "sunset"]


def test_get_image_labels_empty(
    mock_supabase: MockSupabase,
) -> None:
    """Test getting image labels when there are none."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    user_id = uuid.UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8")
    mock_query_response.data = []  # No mementos or image labels

    # When
    result = get_image_labels(user_id)

    # Then
    mock_supabase_client.table.assert_called_once_with("memento")
    assert result == []


def test_get_image_labels_with_empty_values(
    mock_supabase: MockSupabase,
) -> None:
    """Test getting image labels when some are empty or None."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    user_id = uuid.UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8")

    # Response with some empty labels that should be filtered out
    mock_query_response.data = [
        {
            "user_id": user_id,
            "images": [{"image_label": None}, {"image_label": "mountain_view"}],
        },
        {"user_id": user_id, "images": [{"image_label": ""}, {"image_label": "beach"}]},
    ]

    # When
    result = get_image_labels(user_id)

    # Then
    # The function will filter out None and empty values by the Supabase query
    # Only non-empty labels should be returned
    assert sorted(result) == ["beach", "mountain_view"]

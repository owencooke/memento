from server.api.memento.models import NewMemento, UpdateMemento
from server.services.db.models.schema_public_latest import Memento
from server.services.db.queries.memento import (
    create_memento,
    update_memento,
)
from tests.fixtures.supabase import MockSupabase


def test_create_memento(
    mock_supabase: MockSupabase,
    memento_data: dict,
    expected_memento_data: dict,
) -> None:
    """Test inserting a new memento record with the create_memento function."""
    mock_supabase_client, mock_query_response = mock_supabase

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
    mock_supabase_client, mock_query_response = mock_supabase

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

import uuid
from datetime import date

from server.api.memento.models import NewMemento, UpdateMemento
from server.services.db.models.gis import Coordinates
from server.services.db.models.schema_public_latest import Memento
from server.services.db.queries.memento import (
    create_memento,
    update_memento,
)
from tests.fixtures.supabase import MockSupabase


def test_create_memento(mock_supabase: MockSupabase) -> None:
    """Test inserting a new memento record with the create_memento function."""
    mock_supabase_client, mock_query_response = mock_supabase

    # Given
    user_id = uuid.uuid4()
    mock_memento = NewMemento(
        caption="Test Memento",
        location="Poole, UK",
        coordinates=Coordinates(lat=42, long=-71),
        date=date(2023, 1, 1),
    )
    expected_response = {
        "id": 1,
        "user_id": str(user_id),
        "caption": mock_memento.caption,
        "location": mock_memento.location,
        "date": mock_memento.date.isoformat(),
        "coordinates": "0101000020E61000009BA9108FC4CBFFBF9D8026C2865B4940",
    }
    mock_query_response.data = [expected_response]

    # When
    result = create_memento(mock_memento, user_id)

    # Then
    mock_supabase_client.table.assert_called_once_with("memento")
    mock_supabase_client.table().insert.assert_called_once()
    assert isinstance(result, Memento)
    assert result.id == expected_response["id"]
    assert result.caption == expected_response["caption"]
    assert result.user_id == user_id
    assert result.date == mock_memento.date


def test_update_memento(mock_supabase: MockSupabase) -> None:
    """Test inserting a new memento record with the create_memento function."""
    mock_supabase_client, mock_query_response = mock_supabase

    # Given
    id = 1
    user_id = uuid.uuid4()
    mock_memento = UpdateMemento(
        caption="Test Memento",
        location="Poole, UK",
        coordinates=Coordinates(lat=42, long=-71),
        date=date(2023, 1, 1),
    )
    expected_response = {
        "id": id,
        "user_id": str(user_id),
        "caption": mock_memento.caption,
        "location": mock_memento.location,
        "date": mock_memento.date.isoformat(),
        "coordinates": "0101000020E61000009BA9108FC4CBFFBF9D8026C2865B4940",
    }
    mock_query_response.data = [expected_response]

    # When
    result = update_memento(id, mock_memento)

    # Then
    mock_supabase_client.table.assert_called_once_with("memento")
    mock_supabase_client.table().update.assert_called_once()
    assert isinstance(result, Memento)
    assert result.id == expected_response["id"]
    assert result.caption == expected_response["caption"]
    assert result.user_id == user_id
    assert result.date == mock_memento.date

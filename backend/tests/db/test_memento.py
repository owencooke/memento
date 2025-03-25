import uuid
from datetime import date
from typing import Tuple
from unittest.mock import MagicMock

from server.api.memento.models import NewMemento
from server.services.db.models.gis import Coordinates
from server.services.db.models.schema_public_latest import Memento
from server.services.db.queries.memento import (
    create_memento,
)


def test_create_memento(mock_supabase: Tuple[MagicMock, MagicMock]) -> None:
    """Test creating a new memento with the create_memento function."""
    mock_supabase_client, mock_query_response = mock_supabase

    # Given
    user_id = uuid.uuid4()
    new_memento = NewMemento(
        caption="Test Memento",
        location="Poole, UK",
        coordinates=Coordinates(lat=42, long=-71),
        date=date(2023, 1, 1),
    )
    expected_response = {
        "id": 1,
        "user_id": str(user_id),
        "caption": new_memento.caption,
        "location": new_memento.location,
        "date": new_memento.date.isoformat(),
        "coordinates": "0101000020E61000009BA9108FC4CBFFBF9D8026C2865B4940",
    }
    mock_query_response.data = [expected_response]

    # When
    result = create_memento(new_memento, user_id)

    # Then
    mock_supabase_client.table.assert_called_once_with("memento")
    mock_supabase_client.table().insert.assert_called_once()
    assert isinstance(result, Memento)
    assert result.id == expected_response["id"]
    assert result.caption == expected_response["caption"]
    assert result.user_id == user_id

from datetime import date
from uuid import UUID

from server.services.db.models.schema_public_latest import UserInfo
from server.services.db.queries.user import get_user_info
from tests.fixtures.supabase import MockSupabase


def test_get_user_info(mock_supabase: MockSupabase) -> None:
    """Test retrieving user information for a specific user ID."""
    mock_supabase_client, mock_query_response = mock_supabase

    # Given
    expected_user_data = {
        "id": "35b25fe2-08cc-42f6-902c-9eec499d04e8",
        "birthday": "2002-01-01",
    }
    uuid = UUID(expected_user_data["id"])
    mock_query_response.data = [expected_user_data]

    # When
    result = get_user_info(uuid)

    # Then
    mock_supabase_client.table.assert_called_once_with("user_info")
    mock_supabase_client.table().select.assert_called_once_with("*")
    mock_supabase_client.table().select().eq.assert_called_once_with("id", uuid)
    assert isinstance(result, UserInfo)
    assert result.id == uuid
    assert result.birthday == date.fromisoformat(expected_user_data["birthday"])

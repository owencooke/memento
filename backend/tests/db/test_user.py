from datetime import date
from uuid import UUID

from server.services.db.models.schema_public_latest import UserInfo, UserInfoInsert
from server.services.db.queries.user import create_user_info, get_user_info
from tests.fixtures.supabase import MockSupabase


def test_get_user_info(mock_supabase: MockSupabase) -> None:
    """Test retrieving user information for a specific user ID."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

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


def test_create_user_info(mock_supabase: MockSupabase) -> None:
    """Test creating user information record."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    user_id = UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8")
    birthday = date(2002, 1, 1)

    user_info_insert = UserInfoInsert(id=user_id, birthday=birthday)

    expected_response = {
        "id": str(user_id),
        "birthday": "2002-01-01",
        "updated_at": "2023-01-01T00:00:00",
    }
    mock_query_response.data = [expected_response]

    # When
    result = create_user_info(user_info_insert)

    # Then
    mock_supabase_client.table.assert_called_once_with("user_info")
    mock_supabase_client.table().insert.assert_called_once()

    # Check the insert payload includes the correct data
    insert_payload = mock_supabase_client.table().insert.call_args[0][0]
    assert insert_payload["id"] == expected_response["id"]
    assert insert_payload["birthday"] == birthday.isoformat()

    assert isinstance(result, UserInfo)
    assert result.id == user_id
    assert result.birthday == birthday

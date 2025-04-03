from pydantic import UUID4

from server.services.db.config import supabase
from server.services.db.models.schema_public_latest import (
    UserInfo,
    UserInfoInsert,
)


def get_user_info(id: UUID4) -> UserInfo:
    """Gets user info from DB table for specific user id."""
    response = supabase.table("user_info").select("*").eq("id", id).execute()
    return UserInfo(**response.data[0])


def create_user_info(user_info: UserInfoInsert) -> UserInfo:
    """Creates a new user info record."""
    response = (
        supabase.table("user_info")
        .insert({**user_info.model_dump(mode="json")})
        .execute()
    )
    return UserInfo(**response.data[0])

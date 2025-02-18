from pydantic import UUID4
from server.services.db.config import supabase
from server.services.db.models.schema_public_latest import UserInfo


def get_user_info(id: UUID4) -> UserInfo:
    response = supabase.table("user_info").select("*").eq("id", id).execute()
    return UserInfo(**response.data[0])

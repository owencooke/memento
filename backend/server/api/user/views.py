from fastapi import APIRouter, HTTPException
from pydantic import UUID4

from server.services.db.models.schema_public_latest import (
    UserInfo,
    UserInfoInsert,
)
from server.services.db.queries.user import (
    create_user_info,
    get_user_info,
)

router = APIRouter()


@router.get("/{id}")
def user_info(id: UUID4) -> UserInfo:
    """Gets user info for a specific user."""
    user_info = get_user_info(id)
    if not user_info:
        raise HTTPException(status_code=404, detail="User not found")
    return user_info


@router.post("/")
def user_info(body: UserInfoInsert) -> UserInfo:
    """Creates a new user info record for a first time user.

    User should have already been registered via Supabase Auth on client.
    """
    try:
        return create_user_info(body)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

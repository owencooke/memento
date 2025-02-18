from fastapi import APIRouter, HTTPException
from pydantic import UUID4

from server.services.db.models.schema_public_latest import UserInfo
from server.services.db.queries.user import get_user_info

router = APIRouter()


@router.get("/{id}", response_model=UserInfo)
def user_info(id: UUID4) -> UserInfo:
    user_info = get_user_info(id)
    if not user_info:
        raise HTTPException(status_code=404, detail="User not found")
    return user_info

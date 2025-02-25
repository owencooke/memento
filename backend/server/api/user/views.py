from fastapi import APIRouter, HTTPException
from pydantic import UUID4

from server.services.db.models.schema_public_latest import (
    Collections,
    CollectionsInsert,
    UserInfo,
)
from server.services.db.queries.user import (
    fetch_collections,
    get_user_info,
    insert_collection,
)

router = APIRouter()


@router.get("/{id}", response_model=UserInfo)
def user_info(id: UUID4) -> UserInfo:
    """Gets user info for a specific user."""
    user_info = get_user_info(id)
    if not user_info:
        raise HTTPException(status_code=404, detail="User not found")
    return user_info


@router.get("/{id}/collections", response_model=list[Collections])
def get_collections(id: UUID4) -> list[Collections]:
    """Gets collections for a specified user."""
    user_collections = fetch_collections(id)
    if not user_collections:
        raise HTTPException(status_code=404, detail="No collections found")
    return user_collections


@router.post("/{id}/collections", response_model=CollectionsInsert)
def create_collection(collection: CollectionsInsert) -> CollectionsInsert:
    """Create a collection."""
    inserted_collection = insert_collection(collection)
    if not inserted_collection:
        raise HTTPException(status_code=404, detail="Insert Collection Failed")
    return inserted_collection

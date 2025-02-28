from fastapi import APIRouter, Depends, Form, HTTPException
from pydantic import UUID4

from server.api.path import get_user_id
from server.services.db.models.joins import CollectionWithMementos
from server.services.db.models.schema_public_latest import (
    Collection,
    CollectionInsert,
)
from server.services.db.queries.collection import create_collection, get_collections

router = APIRouter()


@router.get("/", response_model=list[CollectionWithMementos])
def get_users_collections(
    user_id: UUID4 = Depends(get_user_id),
) -> list[CollectionWithMementos]:
    """Gets all the collections belonging to a user."""
    collections = get_collections(user_id)
    if not collections:
        raise HTTPException(status_code=404, detail="No collections found")
    return collections


@router.post("/", response_model=CollectionInsert)
def create_new_collection(collection: CollectionInsert) -> CollectionInsert:
    """Create a collection."""
    inserted_collection = create_collection(collection)
    if not inserted_collection:
        raise HTTPException(status_code=404, detail="Insert Collection Failed")
    return inserted_collection

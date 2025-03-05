"""
@description CRUD API routes for Collections.

@requirements FR-3, FR-35, FR-36, FR-37
"""

from fastapi import APIRouter, Depends, HTTPException
from loguru import logger
from pydantic import UUID4

from server.api.collection.models import NewCollection
from server.api.path import get_user_id
from server.services.db.models.joins import CollectionWithMementos
from server.services.db.models.schema_public_latest import (
    Collection,
    HasMementoInsert,
)
from server.services.db.queries.collection import (
    associate_memento,
    create_collection,
    get_collections,
)

router = APIRouter()


@router.get("/", response_model=list[CollectionWithMementos])
async def get_users_collections(
    user_id: UUID4 = Depends(get_user_id),
) -> list[CollectionWithMementos]:
    """Gets all the collections belonging to a user."""
    logger.info("get collection")
    collections = get_collections(user_id)
    if not collections:
        return []
    return collections


@router.post("/")
async def create_new_collection(
    new_collection: NewCollection,
    mementos: list[int],
    user_id: UUID4 = Depends(get_user_id),
) -> Collection:
    """Create a collection."""
    logger.debug(f"Creating a new collection {new_collection}")

    inserted_collection = create_collection(new_collection, user_id)
    if not inserted_collection:
        raise HTTPException(status_code=400, detail="Insert Collection Failed")

    # Associate mementos with the collection
    for memento_id in mementos:
        has_memento = HasMementoInsert(
            collection_id=inserted_collection.id,
            memento_id=memento_id,
        )
        if not associate_memento(has_memento):
            raise HTTPException(
                status_code=400,
                detail="Associate Memento to Collection Failed.",
            )

    return inserted_collection

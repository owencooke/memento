"""
@description CRUD API routes for Collections.

@requirements FR-3, FR-35, FR-36, FR-37
"""

from fastapi import APIRouter, Depends, HTTPException
from loguru import logger
from pydantic import UUID4

from server.api.collection.models import NewCollection, UpdateCollection
from server.api.path import get_user_id
from server.services.db.models.joins import CollectionWithMementos
from server.services.db.models.schema_public_latest import (
    Collection,
    HasMementoInsert,
    HasMementoUpdate,
)
from server.services.db.queries.collection import (
    associate_memento,
    create_collection,
    db_delete_collection,
    get_collections,
    update_associate_memento,
    update_collection,
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
    # for memento_id in mementos:
    #     has_memento = HasMementoInsert(
    #         collection_id=inserted_collection.id,
    #         memento_id=memento_id,
    #     )
    #     if not associate_memento(has_memento):
    #         raise HTTPException(
    #             status_code=400,
    #             detail="Associate Memento to Collection Failed.",
    #         )

    return inserted_collection


@router.put("/{id}")
async def update_collection_and_mementos(
    id: int,
    collection: UpdateCollection,
    mementos: list[int],
) -> Collection:
    """Update a collection."""

    updated_collection = update_collection(id, collection)
    if not updated_collection:
        raise HTTPException(status_code=400, detail="Update collection failed")

    # for memento_id in mementos:
    #     has_memento = HasMementoUpdate(
    #         collection_id=updated_collection.id,
    #         memento_id=memento_id,
    #     )
    #     if not update_associate_memento(has_memento):
    #         raise HTTPException(
    #             status_code=400,
    #             detail="Update Associate Memento to Collection Failed.",
    #         )

    return updated_collection


@router.delete("/{id}")
async def delete_collection(
    id: int,
) -> Collection:
    """Delete a collection."""

    deleted_collection = db_delete_collection(id)
    if not deleted_collection:
        raise HTTPException(status_code=400, detail="Delete collection failed")

    return deleted_collection

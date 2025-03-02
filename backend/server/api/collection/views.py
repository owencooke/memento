from fastapi import APIRouter, Body, Depends, HTTPException
from loguru import logger
from pydantic import UUID4

from server.api.path import get_user_id
from server.services.db.models.gis import Location
from server.services.db.models.joins import CollectionWithMementos
from server.services.db.models.schema_public_latest import (
    Collection,
    CollectionInsert,
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


class CreateCollectionWithLocation(CollectionInsert):
    location: dict
    mementos: list[int]


@router.post("/")
async def create_new_collection(
    new_collection: CreateCollectionWithLocation,
    user_id: UUID4 = Depends(get_user_id),
) -> Collection:
    """Create a collection."""
    logger.debug(f"Creating a new collection {new_collection}")
    new_collection["coordinates"] = Location(
        **new_collection["location"]
    ).to_gis_string()
    new_collection["location"] = new_collection["location"]["text"]

    valid_collection = CollectionInsert.model_validate(new_collection)
    valid_collection.user_id = user_id

    inserted_collection = create_collection(valid_collection)
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

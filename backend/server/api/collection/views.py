from fastapi import APIRouter, Depends, HTTPException
from pydantic import UUID4

from server.api.path import get_user_id
from server.services.db.models.joins import CollectionWithMementos
from server.services.db.models.schema_public_latest import (
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
    collections = get_collections(user_id)
    if not collections:
        raise HTTPException(status_code=404, detail="No collections found")
    return collections


@router.post("/", response_model=CollectionInsert)
def create_new_collection(
    new_collection: CollectionInsert,
    mementos: list[int],
    user_id: UUID4 = Depends(get_user_id),
) -> CollectionInsert:
    """Create a collection."""
    new_collection.user_id = user_id
    inserted_collection = create_collection(new_collection)

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

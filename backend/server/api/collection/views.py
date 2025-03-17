"""
@description CRUD API routes for Collections.

@requirements FR-3, FR-35, FR-36, FR-37
"""

from fastapi import APIRouter, Depends, HTTPException, Response
from loguru import logger
from pydantic import UUID4

from server.api.collection.models import NewCollection, UpdateCollection
from server.api.path import get_user_id
from server.services.db.models.joins import CollectionWithMementos
from server.services.db.models.schema_public_latest import (
    Collection,
    HasMementoInsert,
)
from server.services.db.queries.collection import (
    associate_memento,
    create_collection,
    db_delete_collection,
    get_collection_image_filenames,
    get_collections,
    update_collection,
)
from server.services.process_image.collage import create_collage
from server.services.process_image.converters import pil_to_png_bytes
from server.services.storage.image import download_images

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

    # FIXME: Updating what mementos are on a collection is more difficult than adding

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


@router.post("/{id}")
async def generate_collage(id: int) -> Response:
    """Post route that generates an image representation of a collection as a collage."""
    try:
        image_filenames = get_collection_image_filenames(id)
        images = download_images(image_filenames)
        output_image = await create_collage(images)
        output_bytes = await pil_to_png_bytes(output_image)
        return Response(content=output_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

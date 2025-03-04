"""
@description CRUD API routes for Keepsakes/Mementos.
@requirements FR-17, FR-19, FR-20, FR-21, FR-26, FR-27, FR-28
"""

import json
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import JSONResponse
from pydantic import UUID4

from server.api.memento.models import (
    NewImageMetadata,
    NewMemento,
    UpdateMemento,
)
from server.api.path import get_user_id
from server.services.db.models.joins import MementoWithImages
from server.services.db.queries.image import (
    create_image_metadata,
    delete_image_metadata,
    get_images_for_memento,
    update_image_metadata,
)
from server.services.db.queries.memento import (
    create_memento,
    get_mementos,
    update_memento,
)
from server.services.storage.image import delete_images, get_image_url, upload_image

router = APIRouter()


@router.get("/")
def get_users_mementos(
    user_id: UUID4 = Depends(get_user_id),
) -> list[MementoWithImages]:
    """Gets all the mementos belonging to a user."""
    mementos = get_mementos(user_id)

    # Get private URLs for each image
    for memento in mementos:
        for image in memento.images:
            image.url = get_image_url(image.filename)

    # Sort images by order index
    memento.images.sort(key=lambda image: image.order_index)
    return mementos


@router.post("/")
async def create_new_memento(
    memento_str: Annotated[str, Form()],
    image_metadata_str: Annotated[str, Form()],
    images: list[UploadFile],
    user_id: UUID4 = Depends(get_user_id),
) -> JSONResponse:
    """Post route for creating a new memento.

    3 key steps:
        1. Creates a memento DB record
        2. Uploads associated images to object storage,
        3. Stores a metadata DB record for each image.

    Uses multipart/form-data to upload JSON/binary payloads simultaneously.
    """
    # Parse JSON objects from multipart form strings
    memento = NewMemento.model_validate(json.loads(memento_str))
    image_metadata = [
        NewImageMetadata.model_validate(item) for item in json.loads(image_metadata_str)
    ]

    # Create new memento in DB
    new_memento = create_memento(memento, user_id)

    for i in range(len(images)):
        # Upload image to object storage
        path = await upload_image(images[i])

        # Create new image metadata records in DB
        image_metadata[i].filename = path
        create_image_metadata(image_metadata[i], new_memento.id)

    return JSONResponse(
        content={"message": f"Successfully created new Memento[{new_memento.id}]"},
    )


@router.put("/{id}}")
async def update_memento_and_images(
    id: int,
    memento_str: Annotated[str, Form()],
    image_metadata_str: Annotated[str, Form()],
    images: list[UploadFile],
) -> JSONResponse:
    """Put route for updating a memento and its associated images.

    4 key steps:
        1. Updates the memento DB record
        2. For new images, uploads files to object storage / creates new DB record
        3. Updates any image DB records with new order_index (position could have changed)
        4. Delete any images from DB/storage that were removed

    Uses multipart/form-data to upload JSON/binary payloads simultaneously.
    """
    # Parse JSON objects from multipart form strings
    new_memento_fields = UpdateMemento.model_validate(json.loads(memento_str))
    image_metadata = [
        NewImageMetadata.model_validate(item) for item in json.loads(image_metadata_str)
    ]

    # Update the memento record
    updated_memento = update_memento(id, new_memento_fields)

    # Update ordering of previous images (or delete if removed)
    files_to_delete = []
    for old_metadata in get_images_for_memento(id):
        new_metadata = next(
            (new for new in image_metadata if new.filename == old_metadata.filename),
            None,
        )
        if new_metadata is None:
            # User removed the old image; delete from DB/storage
            delete_image_metadata(old_metadata.id)
            files_to_delete.append(old_metadata.filename)
        else:
            # User kept old image; update DB record in case images re-ordered
            update_image_metadata(old_metadata.id, new_metadata)
    if len(files_to_delete) > 0:
        delete_images(files_to_delete)

    # Upload new images/metadata
    for image in images:
        await upload_image(image)
        for i in range(len(image_metadata)):
            if image_metadata[i].filename == image.filename:
                create_image_metadata(image_metadata.pop(i), updated_memento.id)
                break

    return JSONResponse(
        content={"message": f"Successfully updated Memento[{updated_memento.id}]"},
    )

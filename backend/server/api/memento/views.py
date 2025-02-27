import json
from typing import Annotated
from fastapi import APIRouter, Depends, File, Form, UploadFile

from pydantic import UUID4
from server.api.path import get_user_id
from server.services.db.models.joins import MementoWithImages
from server.services.db.models.schema_public_latest import (
    ImageInsert,
    Memento,
    MementoInsert,
)
from server.services.db.queries.image import create_image_metadata
from server.services.storage.image import upload_image
from server.services.db.queries.memento import create_memento, get_mementos

router = APIRouter()


@router.get("/")
def get_users_mementos(
    user_id: UUID4 = Depends(get_user_id),
) -> list[MementoWithImages]:
    """Gets all the mementos belonging to a user."""
    return get_mementos(user_id)


@router.post("/")
async def create_new_memento(
    memento: Annotated[str, Form()],
    imageMetadata: Annotated[str, Form()],
    images: Annotated[list[UploadFile], File()],
    user_id: UUID4 = Depends(get_user_id),
) -> MementoInsert:
    """Creates a new memento, uploads associated images to object storage, and stores image metadata."""

    # Parse and validate form data
    memento_data = MementoInsert.model_validate(json.loads(memento))
    image_metadata_list = [
        ImageInsert.model_validate(img) for img in json.loads(imageMetadata)
    ]

    # Create new memento record
    memento_data.user_id = user_id
    new_memento = create_memento(memento_data)

    for i in range(len(images)):
        # Upload image to object storage
        path = await upload_image(images[i])

        # Create new image metadata records
        image_metadata_list[i].filename = path
        create_image_metadata(image_metadata_list[i], new_memento)

    return new_memento

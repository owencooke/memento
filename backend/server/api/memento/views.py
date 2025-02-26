import json
from typing import Annotated
from fastapi import APIRouter, File, Form, UploadFile

from server.services.db.models.schema_public_latest import (
    ImageInsert,
    Memento,
    MementoInsert,
)
from server.services.db.queries.image import create_image_metadata
from server.services.storage.image import upload_image
from server.services.db.queries.memento import create_memento

router = APIRouter()


@router.post("/")
async def create_memento_route(
    memento: Annotated[str, Form()],
    imageMetadata: Annotated[str, Form()],
    images: Annotated[list[UploadFile], File()],
) -> Memento:
    """Creates a new memento, uploads associated images to object storage, and stores image metadata."""

    # Parse and validate form data
    memento_data = MementoInsert.model_validate(json.loads(memento))
    image_metadata_list = [
        ImageInsert.model_validate(img) for img in json.loads(imageMetadata)
    ]

    # Create new memento record
    new_memento = create_memento(memento_data)

    for i in range(len(images)):
        # Upload image to object storage
        path = upload_image(images[i])

        # Create new image metadata records
        image_metadata_list[i].filename = path
        create_image_metadata(image_metadata_list[i])

    return new_memento

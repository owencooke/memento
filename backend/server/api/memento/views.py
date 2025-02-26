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
    memento: Annotated[MementoInsert, Form()],
    imageMetadata: Annotated[list[ImageInsert], Form()],
    images: Annotated[list[UploadFile], File()],
) -> Memento:
    """Creates a new memento, uploads associated images to object storage, and stores image metadata."""

    # Create new memento record
    new_memento = create_memento(memento)

    for i in range(len(images)):
        # Upload image to object storage
        path = upload_image(images[i])

        # Create new image metadata records
        imageMetadata[i].filename = path
        create_image_metadata(imageMetadata[i])

    return new_memento

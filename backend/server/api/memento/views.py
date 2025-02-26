from fastapi import APIRouter, File, UploadFile

from pydantic import BaseModel
from server.services.db.models.schema_public_latest import (
    ImageInsert,
    Memento,
    MementoInsert,
)
from server.services.db.queries.image import upload_image
from server.services.db.queries.memento import create_memento

router = APIRouter()


class MementoAndImages(BaseModel):
    memento: MementoInsert
    imageMetadata: list[ImageInsert]


@router.post("/")
async def create_memento_route(
    body: MementoAndImages,
    files: list[UploadFile] = File(...),
) -> Memento:
    """Creates a new memento, uploads associated images to object storage, and stores image metadata."""

    # Create new memento record
    new_memento = create_memento(body.memento)

    for i in range(len(files)):
        # Upload image to object storage
        path = upload_image(files[i])

        # Create new image metadata records

    return new_memento

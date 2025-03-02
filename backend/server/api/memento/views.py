import json
from typing import Annotated
from fastapi import APIRouter, Depends, File, Form, UploadFile
from pydantic import UUID4

from server.api.memento.models import NewImageMetadata, NewMemento
from server.api.path import get_user_id
from server.services.db.models.joins import MementoWithImages
from server.services.db.models.schema_public_latest import Memento
from server.services.db.queries.image import create_image_metadata
from server.services.db.queries.memento import create_memento, get_mementos
from server.services.storage.image import get_image_url, upload_image

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
    return mementos


@router.post("/")
async def create_new_memento(
    memento_str: Annotated[str, Form()],
    image_metadata_str: Annotated[str, Form()],
    images: Annotated[list[UploadFile], File()],
    user_id: UUID4 = Depends(get_user_id),
) -> Memento:
    """Post route for creating a new memento.

    3 key steps:
        1. creates a memento DB record
        2. uploads associated images to object storage,
        3. stores a metadata DB record for each image.

    Uses multipart/form-data to upload JSON/binary payloads simultaneously.
    """
    # Parse JSON objects from multipart form strings
    memento = NewMemento.model_validate(json.loads(memento_str))
    image_metadata = NewImageMetadata.model_validate(json.loads(image_metadata_str))

    # Create new memento in DB
    new_memento = create_memento(memento, user_id)

    for i in range(len(images)):
        # Upload image to object storage
        path = await upload_image(images[i])

        # Create new image metadata records in DB
        image_metadata[i].filename = path
        create_image_metadata(image_metadata[i], new_memento.id)

    return new_memento

import json
from typing import Annotated
from fastapi import APIRouter, Depends, File, Form, UploadFile

from pydantic import UUID4
from server.api.path import get_user_id
from server.services.db.models.gis import Location
from server.services.db.models.joins import MementoWithImages
from server.services.db.models.schema_public_latest import (
    ImageInsert,
    MementoInsert,
)
from server.services.db.queries.image import create_image_metadata
from server.services.storage.image import get_image_url, upload_image
from server.services.db.queries.memento import create_memento, get_mementos

router = APIRouter()


@router.get("/")
def get_users_mementos(
    user_id: UUID4 = Depends(get_user_id),
) -> list[MementoWithImages]:
    """Gets all the mementos belonging to a user."""
    mementos = get_mementos(user_id)

    # Get private URLs for each image
    for memento in mementos:
        print(memento.coordinates)
        for image in memento.images:
            image.url = get_image_url(image.filename)
    return mementos


@router.post("/")
async def create_new_memento(
    memento: Annotated[str, Form()],
    imageMetadata: Annotated[str, Form()],
    images: Annotated[list[UploadFile], File()],
    user_id: UUID4 = Depends(get_user_id),
) -> MementoInsert:
    """Creates a new memento, uploads associated images to object storage, and stores image metadata."""
    # Parse Memento fields from form data
    memento_data = json.loads(memento)
    memento_data["coordinates"] = Location(**memento_data["location"]).to_gis_string()
    memento_data["location"] = memento_data["location"]["text"]
    memento_data = MementoInsert.model_validate(memento_data)

    # Parse Image metadata fields from form data
    image_metadata_list = []
    for img_data in json.loads(imageMetadata):
        img_data["coordinates"] = (
            Location(lat=img_data["lat"], long=img_data["long"])
        ).to_gis_string()
        image_metadata_list.append(ImageInsert.model_validate(img_data))

    # Create new memento in DB
    memento_data.user_id = user_id
    new_memento = create_memento(memento_data)

    for i in range(len(images)):
        # Upload image to object storage
        path = await upload_image(images[i])

        # Create new image metadata records in DB
        image_metadata_list[i].filename = path
        create_image_metadata(image_metadata_list[i], new_memento)

    return new_memento

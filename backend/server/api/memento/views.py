"""
@description CRUD API routes for Keepsakes/Mementos.
@requirements FR-8, FR-11, FR-12, FR-13, FR-14, FR-15, FR-16, FR-17, FR-19, \
        FR-20, FR-21, FR-26, FR-27, FR-28, FR-30, FR31, FR-32, FR-33, FR-34
"""

import json
from typing import Annotated, Optional

import pytesseract
from fastapi import APIRouter, BackgroundTasks, Depends, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from loguru import logger
from PIL import Image
from pydantic import UUID4

from server.api.memento.models import (
    CreateMementoSuccessResponse,
    ImageLabelResponse,
    MementoFilterParams,
    NewImageMetadata,
    NewMemento,
    UpdateMemento,
)
from server.api.path import get_user_id
from server.services.db.models.joins import MementoWithImages
from server.services.db.models.schema_public_latest import Memento
from server.services.db.queries.image import (
    create_image_metadata,
    delete_image_metadata,
    get_images_for_memento,
    update_image,
)
from server.services.db.queries.memento import (
    create_memento,
    db_delete_memento,
    get_image_labels,
    get_mementos,
    update_memento,
)
from server.services.process_image.converters import upload_file_to_pil
from server.services.process_image.image_class import predict_class
from server.services.storage.image import (
    delete_images,
    get_bulk_image_urls,
    upload_image,
)

router = APIRouter()


@router.get("/")
def get_users_mementos(
    user_id: UUID4 = Depends(get_user_id),
    filter_query: MementoFilterParams = Depends(MementoFilterParams),
) -> list[MementoWithImages]:
    """Gets all the mementos belonging to a user."""
    mementos = get_mementos(user_id, filter_query)
    # Get all image URLs
    image_urls = get_bulk_image_urls(
        [image.filename for memento in mementos for image in memento.images],
    )

    # Assign URLs to images and sort in proper order for UI
    for memento in mementos:
        for image in memento.images:
            image.url = image_urls.get(image.filename, "")
        # Sort images by order index
        memento.images.sort(key=lambda image: image.order_index)

    return mementos


# Helper function for image processing for creating/editing a memento
def process_images_in_background(
    images: list[tuple[Image.Image, str]],
    memento_id: int,
) -> None:
    """Handles image processing in the background."""
    for image, filename in images:  # Accessing each tuple's Image and filename
        try:
            # Extract text from the image
            extracted_text = pytesseract.image_to_string(image)

            # Classify label
            predicted_class = predict_class(image)

            update_image(
                memento_id,
                filename,
                {"detected_text": extracted_text, "image_label": predicted_class},
            )
            logger.info(f"Adding detected text: {extracted_text}")
            logger.info(f"Adding predicted class: {predicted_class}")

        except Exception as e:
            logger.error(f"Failed to process image {filename}: {e}")


@router.post("/")
async def create_new_memento(
    background_tasks: BackgroundTasks,
    memento_str: Annotated[str, Form()],
    image_metadata_str: Annotated[str, Form()],
    images: list[UploadFile],
    user_id: UUID4 = Depends(get_user_id),
) -> CreateMementoSuccessResponse:
    """Post route for creating a new memento.

    Three main steps:
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

    pil_images = []
    for i in range(len(images)):
        # Upload image to object storage
        path = await upload_image(images[i])

        # Create new image metadata records in DB
        image_metadata[i].filename = path

        create_image_metadata(image_metadata[i], new_memento.id)

        new_image = await upload_file_to_pil(images[i])
        pil_images.append((new_image, path))

    background_tasks.add_task(process_images_in_background, pil_images, new_memento.id)
    logger.info("Running image processing in the background...")

    return CreateMementoSuccessResponse(new_memento_id=new_memento.id)


@router.put("/{id}")
async def update_memento_and_images(
    background_tasks: BackgroundTasks,
    id: int,
    memento_str: Annotated[str, Form()],
    image_metadata_str: Annotated[str, Form()],
    images: Optional[list[UploadFile]] = None,
) -> JSONResponse:
    """Put route for updating a memento and its associated images.

    Three main steps:
        1. Updates the memento DB record
        2. For old images, delete entries user removed or update with new re-ordering
        3. For new images, uploads files to object storage / creates new DB record

    Uses multipart/form-data to upload JSON/binary payloads simultaneously.
    """

    # Parse JSON objects from multipart form strings
    new_memento_fields = UpdateMemento.model_validate(json.loads(memento_str))
    image_metadata = [
        NewImageMetadata.model_validate(item) for item in json.loads(image_metadata_str)
    ]

    # Update the memento record
    updated_memento = update_memento(id, new_memento_fields)
    logger.info(f"Updated memento with ID={updated_memento.id}")

    # Old images
    files_to_delete = []
    for metadata in get_images_for_memento(id):
        image_kept = next(
            (new for new in image_metadata if new.filename == metadata.filename),
            None,
        )
        if image_kept:
            # User kept old image; update DB record in case images re-ordered
            update_image(
                id,
                image_kept.filename,
                {"order_index": image_kept.order_index},
            )
            logger.info(f"Updated image metadata for file: {image_kept.filename}")
        else:
            # User removed the old image; delete from DB/storage
            delete_image_metadata(metadata.id)
            files_to_delete.append(metadata.filename)
            logger.info(f"Removed Image[{metadata.id}] record from DB")
    if files_to_delete:
        delete_images(files_to_delete)
        logger.info(f"Deleted images from storage: {files_to_delete}")

    # New images
    if images:
        pil_images = []
        for image in images:
            # Upload image file to storage
            path = await upload_image(image)
            logger.info(f"Uploaded new image {path} to storage.")
            # Create new DB record for metadata
            new_metadata = next(
                new for new in image_metadata if new.filename == image.filename
            )
            new_metadata.filename = path

            # Create image metadata in DB
            create_image_metadata(new_metadata, updated_memento.id)
            logger.info(f"Created image metadata record for {metadata.filename}")

            new_image = await upload_file_to_pil(image)
            pil_images.append((new_image, path))

        background_tasks.add_task(
            process_images_in_background,
            pil_images,
            updated_memento.id,
        )
        logger.info("Running image processing in the background...")

    return JSONResponse(
        content={"message": f"Successfully updated Memento[{updated_memento.id}]"},
    )


@router.delete("/{id}")
async def delete_memento(
    id: int,
) -> Memento:
    """Delete a memento"""
    deleted_memento = db_delete_memento(id)

    if not deleted_memento:
        raise HTTPException(status_code=400, detail="Delete collection failed")

    return deleted_memento


@router.get("/image_labels")
def get_users_image_labels(
    user_id: UUID4 = Depends(get_user_id),
) -> list[ImageLabelResponse]:
    """Gets each unique image label from images associated with user's mementos"""

    def format_label(snake_case: str) -> str:
        return " ".join(word.capitalize() for word in snake_case.split("_"))

    labels = get_image_labels(user_id)
    return [
        ImageLabelResponse(value=label, label=format_label(label)) for label in labels
    ]

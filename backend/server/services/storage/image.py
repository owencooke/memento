"""
@description Supabase Storage functions for images
@requirements FR-20, FR-28, FR-31
"""

import io
import uuid

from fastapi import UploadFile
from loguru import logger
from PIL import Image

from server.services.db.config import supabase


async def upload_image(file: UploadFile) -> str:
    """Uploads an image to Supabase Storage API. Returns path in /images bucket."""
    path = str(uuid.uuid4())
    image_content = await file.read()
    response = supabase.storage.from_("images").upload(
        file=image_content,
        path=path,
        file_options={"content-type": file.content_type},
    )
    return response.path


def get_image_url(filename: str) -> str:
    """Uses Supabase Storage API to create signed url for a stored image."""
    response = supabase.storage.from_("images").create_signed_url(filename, 86400)
    return response["signedUrl"]


def delete_images(filenames: list[str]) -> bool:
    """Uses Supabase Storage API to delete a file from /images bucket."""
    response = supabase.storage.from_("images").remove(filenames)
    return len(response) == 1


def download_images(filenames: list[str]) -> list[Image.Image]:
    """Download multiple images from Supabase storage and return as PIL Images."""
    images = []
    for file in filenames:
        try:
            response = supabase.storage.from_("images").download(file)
            image = Image.open(io.BytesIO(response)).convert("RGB")
            images.append(image)
        except Exception as e:
            logger.info(
                f"Failed to convert image {file} from Supabase to PIL with error: {e}",
            )
    return images

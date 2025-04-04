"""
@description Supabase Storage functions for images
@requirements FR-20, FR-28, FR-31
"""

import io
import uuid

from fastapi import UploadFile
from loguru import logger
from PIL import Image

from server.services import db


async def upload_image(file: UploadFile) -> str:
    """Uploads an image to Supabase Storage API. Returns path in /images bucket."""
    path = str(uuid.uuid4())
    image_content = await file.read()
    await file.seek(0)
    response = db.supabase.storage.from_("images").upload(
        file=image_content,
        path=path,
        file_options={"content-type": file.content_type},
    )
    return response.path


def delete_images(filenames: list[str]) -> bool:
    """Uses Supabase Storage API to delete a file from /images bucket."""
    response = db.supabase.storage.from_("images").remove(filenames)
    return len(response) == 1


def get_image_url(filename: str, expires_in: int = 86400) -> str:
    """Uses Supabase Storage API to create signed url for a stored image."""
    response = db.supabase.storage.from_("images").create_signed_url(
        filename,
        expires_in,
    )
    return response["signedUrl"]


def get_bulk_image_urls(
    filenames: list[str],
    expires_in: int = 86400,
) -> dict[str, str]:
    """Uses Supabase Storage API to create multiple signed urls in a single request.

    Returns a dictionary mapping filenames to their signed URLs
    """
    if not filenames:
        return {}
    response = db.supabase.storage.from_("images").create_signed_urls(
        filenames,
        expires_in,
    )
    return {item["path"]: item["signedUrl"] for item in response}


def download_images(filenames: list[str]) -> list[Image.Image]:
    """Download multiple images from Supabase storage and return as PIL Images."""
    images = []
    for file in filenames:
        try:
            response = db.supabase.storage.from_("images").download(file)
            image = Image.open(io.BytesIO(response)).convert("RGBA")
            images.append(image)
        except Exception as e:
            logger.info(
                f"Failed to convert image {file} from Supabase to PIL with error: {e}",
            )
    return images

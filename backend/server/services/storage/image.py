"""
@description Supabase Storage functions for images.
@requirements FR-20, FR-28
"""

import uuid
from fastapi import UploadFile

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

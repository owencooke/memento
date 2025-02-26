from fastapi import UploadFile
from server.services.db.config import supabase


async def upload_image(file: UploadFile) -> str:
    "Uses Supabase Storage API to upload an image; returns relative path in /images bucket"
    image_content = await file.read()
    response = supabase.storage.from_("images").upload(
        file=image_content,
        path=file.filename,
        file_options={"content-type": file.content_type},
    )
    print(response)
    return response.path

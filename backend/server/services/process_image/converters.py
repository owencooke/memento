from io import BytesIO

from fastapi import UploadFile
from PIL import Image


async def upload_file_to_pil(image: UploadFile) -> Image.Image:
    """Converts a FastAPI UploadFile to a PIL Image."""
    image_bytes = await image.read()
    return Image.open(BytesIO(image_bytes))


async def pil_to_png_bytes(image: Image.Image) -> bytes:
    """Converts a PIL Image to a PNG photo byte array."""
    output_bytes = BytesIO()
    image.save(output_bytes, format="PNG")
    output_bytes.seek(0)
    return output_bytes.getvalue()

from io import BytesIO

from fastapi import UploadFile
from loguru import logger
from PIL import Image


async def upload_file_to_pil(image: UploadFile) -> Image.Image:
    """Converts a FastAPI UploadFile to a PIL Image."""
    image_bytes = await image.read()
    return Image.open(BytesIO(image_bytes))


async def pil_to_png_bytes(
    image: Image.Image,
    max_size_kb: int = 500,
    compress_level: int = 6,
) -> bytes:
    """Converts a PIL Image to a compressed PNG."""
    buffer = BytesIO()
    width, height = image.size
    while True:
        buffer.seek(0)
        buffer.truncate()

        # Save with current compression level
        image.save(buffer, format="PNG", compress_level=compress_level)

        # Check size constraint in KB
        size_kb = buffer.tell() / 1024
        logger.debug(f"Compressed image size: {size_kb}")
        if size_kb <= max_size_kb or (width < 200 and height < 200):
            break

        # Scale down by 90% and try again
        width = int(width * 0.9)
        height = int(height * 0.9)
        image = image.resize((width, height), Image.Resampling.LANCZOS)

    return buffer.getvalue()

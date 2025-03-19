from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Response
from loguru import logger
from PIL import Image

from server.services.db.models.schema_public_latest import Collection
from server.services.process_image.collage.generator import CollageGenerator
from server.services.process_image.converters import pil_to_png_bytes

router = APIRouter(prefix="/testing", tags=["testing"])


@router.get("/collage")
async def test_collage(
    folder_path: str = Query(
        ...,
        description="Local folder path containing test image files",
    ),
    title: str = Query("Test Collection", description="Collection title"),
    caption: Optional[str] = Query(None, description="Collection caption"),
    location: Optional[str] = Query(None, description="Collection location"),
) -> Response:
    """
    TEST ENDPOINT to generate a collage from a directory containing local images.
    """
    logger.info(f"Testing collage generation with folder: {folder_path}")

    try:
        # Get all image files in the directory
        folder = Path(folder_path)
        if not folder.exists() or not folder.is_dir():
            raise Exception("Folder not found or is not a directory")
        image_files = [file for file in folder.iterdir()]
        if not image_files:
            raise Exception("No image files found in the specified folder")

        # Load images
        images = []
        for image_file in image_files:
            try:
                img = Image.open(image_file)
                images.append(img)
            except Exception as e:
                logger.error(f"Failed to open image {image_file}: {e}")

        logger.info(f"Successfully loaded {len(images)} images")

        # Mock collection
        collection = Collection(
            id=1,
            title=title,
            caption=caption,
            location=location,
            date=datetime.now().date(),
            user_id="8a111e4b-8727-4ab6-a19a-6177657e6b35",
        )

        # Generate collage
        generator = CollageGenerator()
        collage = await generator.create_collage(collection, images)

        output_bytes = await pil_to_png_bytes(collage)
        return Response(content=output_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

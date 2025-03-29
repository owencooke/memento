"""
@description API routes for Image Processing
@requirements FR-8, FR-10, FR-11
"""

import pytesseract
from fastapi import APIRouter, HTTPException, Response, UploadFile

from server.services.process_image.background import (
    BackgroundRemovalError,
    remove_background,
)
from server.services.process_image.converters import (
    pil_to_png_bytes,
    upload_file_to_pil,
)
from server.services.process_image.image_class import predict_class

router = APIRouter()


@router.post("/remove-background")
async def remove_image_background(image_file: UploadFile) -> Response:
    """Post route that takes an image and removes its background."""
    try:
        input_image = await upload_file_to_pil(image_file)
        output_image = await remove_background(input_image)
        output_bytes = await pil_to_png_bytes(output_image)
        return Response(content=output_bytes, media_type="image/png")
    except BackgroundRemovalError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/extract-text")
async def extract_text(image_file: UploadFile) -> str:
    """Uses OCR library to extract text from image"""
    try:
        input_image = await upload_file_to_pil(image_file)

        return pytesseract.image_to_string(input_image)

    except Exception as e:
        return {"error": str(e)}


@router.post("/classify")
async def classify_image(image_file: UploadFile) -> str:
    """Test route for using Tensorflow/Keras to classify image"""
    try:
        input_image = await upload_file_to_pil(image_file)
        return predict_class(input_image)
    except Exception as e:
        return {"error": str(e)}

"""
@description API routes for Image Processing
@requirements FR-10
"""

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
    

@router.post("/classify-image")
async def classify_image(image_file: UploadFile) -> str:
    """Post route that takes an image and performs image classification"""
    input_image = await upload_file_to_pil(image_file)
    predicted_class = predict_class(input_image)

    return predicted_class

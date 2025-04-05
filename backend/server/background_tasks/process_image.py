import pytesseract
from loguru import logger
from PIL import Image

from server.services.db.queries.image import update_image
from server.services.process_image.image_class import predict_class


def process_images_in_background(
    images: list[tuple[Image.Image, str]],
) -> None:
    """Handles image processing in the background.

    Performs both image classifcation and OCR text extraction.

    Ran when new images uploaded during create/edit memento.
    """
    for image, filename in images:  # Accessing each tuple's Image and filename
        try:
            # Extract text from the image
            extracted_text = pytesseract.image_to_string(image)

            # Classify label
            predicted_class = predict_class(image)

            update_image(
                filename,
                {"detected_text": extracted_text, "image_label": predicted_class},
            )
            logger.info(f"Adding detected text: {extracted_text}")
            logger.info(f"Adding predicted class: {predicted_class}")

        except Exception as e:
            logger.error(f"Failed to process image {filename}: {e}")

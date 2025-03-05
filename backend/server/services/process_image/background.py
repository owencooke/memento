from PIL.Image import Image
from rembg import remove


class BackgroundRemovalError(Exception):
    """Raised when background removal fails."""

    def __init__(self, message: str = "Failed to remove background from image") -> None:
        self.message = message
        super().__init__(self.message)


async def remove_background(image: Image) -> Image:
    """Attempts to remove the background from an image."""
    try:
        # Remove background
        output_image = remove(image).convert("RGBA")

        # Crop excess transparent content
        bounding_box = output_image.getbbox()
        if bounding_box:
            output_image = output_image.crop(bounding_box)

        return output_image
    except Exception as e:
        raise BackgroundRemovalError from e

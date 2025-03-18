from loguru import logger
from PIL import Image, ImageDraw, ImageOps


class ImageProcessor:
    """Handles image processing operations for a collage."""

    @staticmethod
    def prepare_image(
        image: Image.Image,
        target_size: tuple[int, int],
        corner_radius: int,
    ) -> Image.Image:
        """Resize image and apply rounded corners."""
        try:
            # Resize the image maintaining aspect ratio
            resized_img = ImageOps.fit(image, target_size, Image.Resampling.LANCZOS)

            # Apply rounded corners
            rounded_img = Image.new("RGBA", target_size, (0, 0, 0, 0))
            mask = Image.new("L", target_size, 0)
            mask_draw = ImageDraw.Draw(mask)
            mask_draw.rounded_rectangle(
                (0, 0, target_size[0], target_size[1]),
                corner_radius,
                fill=255,
            )

            # Apply mask to create rounded corners
            rounded_img.paste(resized_img, (0, 0), mask)
            return rounded_img
        except Exception as e:
            logger.error(f"Error preparing image: {e!s}")
            raise

    @staticmethod
    def rotate_image(image: Image.Image, angle: int) -> Image.Image:
        """Rotate an image by the specified angle."""
        try:
            # Use RGBA mode to preserve transparency during rotation
            if image.mode != "RGBA":
                image = image.convert("RGBA")

            # Rotate the image
            return image.rotate(
                angle,
                expand=True,
                resample=Image.Resampling.BICUBIC,
            )
        except Exception as e:
            logger.error(f"Error rotating image: {e!s}")
            raise

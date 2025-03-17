import random
from typing import Optional
from PIL import Image, ImageDraw, ImageOps
from loguru import logger


class ImageProcessor:
    """Handles image processing operations for a collage."""

    @staticmethod
    def prepare_image(
        image: Image.Image, target_size: tuple[int, int], corner_radius: int
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
                (0, 0, target_size[0], target_size[1]), corner_radius, fill=255
            )

            # Apply mask to create rounded corners
            rounded_img.paste(resized_img, (0, 0), mask)
            return rounded_img
        except Exception as e:
            logger.error(f"Error preparing image: {str(e)}")
            raise

    @staticmethod
    def rotate_image(image: Image.Image, angle: int) -> Image.Image:
        """Rotate an image by the specified angle."""
        try:
            # Use RGBA mode to preserve transparency during rotation
            if image.mode != "RGBA":
                image = image.convert("RGBA")

            # Rotate the image
            rotated = image.rotate(
                angle, expand=True, resample=Image.Resampling.BICUBIC
            )
            return rotated
        except Exception as e:
            logger.error(f"Error rotating image: {str(e)}")
            raise

    @staticmethod
    def find_placement_position(
        image_size: tuple[int, int],
        used_areas: list[tuple[int, int, int, int]],
        bounds: tuple[int, int, int, int],
        max_attempts: int = 100,
        max_overlap_percent: float = 0.3,
    ) -> Optional[tuple[int, int]]:
        """Find a position for a new image with limited overlap with previous used areas."""
        margin, top, canvas_width, bottom = bounds
        img_width, img_height = image_size

        for _ in range(max_attempts):
            x_offset = random.randint(margin, canvas_width - img_width - margin)
            y_offset = random.randint(top, bottom - img_height)

            # Check overlap with other images
            overlap_too_much = False
            current_rect = (
                x_offset,
                y_offset,
                x_offset + img_width,
                y_offset + img_height,
            )

            for used_rect in used_areas:
                # Calculate overlap area
                overlap_x = max(
                    0,
                    min(current_rect[2], used_rect[2])
                    - max(current_rect[0], used_rect[0]),
                )
                overlap_y = max(
                    0,
                    min(current_rect[3], used_rect[3])
                    - max(current_rect[1], used_rect[1]),
                )
                overlap_area = overlap_x * overlap_y
                current_area = img_width * img_height

                # If overlap is more than the threshold, try another position
                if overlap_area > (current_area * max_overlap_percent):
                    overlap_too_much = True
                    break

            if not overlap_too_much:
                return x_offset, y_offset

        # Could not find a suitable position
        return None

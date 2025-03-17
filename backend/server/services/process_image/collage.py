import os
import random
from datetime import datetime
from typing import Optional
from PIL import Image, ImageDraw, ImageFont, ImageOps
from loguru import logger
from server.config.settings import ROOT_DIR
from server.services.db.models.schema_public_latest import Collection


class FontManager:
    """Manages font loading and text operations."""

    @staticmethod
    def load_font(font_name: str, size: int) -> ImageFont.FreeTypeFont:
        """Attempts to load a font; falls back to default with detailed logging."""
        font_path = os.path.join(ROOT_DIR, "assets/fonts", font_name)
        try:
            if os.path.exists(font_path):
                font = ImageFont.truetype(font_path, size)
                return font
            else:
                logger.warning(
                    f"Font file not found at {font_path}, falling back to default"
                )
        except Exception as e:
            logger.error(f"Error loading font {font_name}: {str(e)}")
        return ImageFont.load_default()

    @staticmethod
    def get_text_dimensions(
        draw: ImageDraw.Draw, text: str, font: ImageFont.FreeTypeFont
    ) -> tuple[int, int]:
        """Calculate text dimensions using textbbox for accurate sizing."""
        bbox = draw.textbbox((0, 0), text, font=font)
        width = bbox[2] - bbox[0]
        height = bbox[3] - bbox[1]
        return width, height

    @staticmethod
    def center_text(
        draw: ImageDraw.Draw,
        text: str,
        font: ImageFont.FreeTypeFont,
        y_position: int,
        canvas_width: int,
        fill_color: tuple[int, int, int],
    ) -> None:
        """Center text horizontally on the canvas at the specified y-position."""
        text_width, _ = FontManager.get_text_dimensions(draw, text, font)
        x_position = (canvas_width - text_width) // 2
        draw.text((x_position, y_position), text, fill=fill_color, font=font)
        return y_position + FontManager.get_text_dimensions(draw, text, font)[1]


class ImageProcessor:
    """Handles image processing operations for the collage."""

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
        """Find a suitable position for an image with limited overlap."""
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

        return None  # Could not find suitable position


class CollageGenerator:
    """Main class for generating artistic collages."""

    def __init__(self):
        self.font_manager = FontManager()
        self.image_processor = ImageProcessor()

    async def create_collage(
        self,
        collection: Collection,
        images: list[Image.Image],
        # Phone-optimized dimensions (iPhone 13 aspect ratio at reasonable resolution)
        canvas_size: tuple[int, int] = (1170, 2532),
        min_image_size: tuple[int, int] = (300, 300),
        max_image_size: tuple[int, int] = (500, 500),
        margin: int = 40,
        title_height: int = 100,
        corner_radius: int = 15,
    ) -> Image.Image:
        """Creates an artistic collage optimized for mobile phone display."""
        logger.info(f"Creating collage for collection: {collection.title}")
        logger.debug(f"Number of images: {len(images)}")

        # Create canvas with phone-optimized dimensions
        collage_width, collage_height = canvas_size

        # Create blank white collage
        collage = Image.new("RGB", canvas_size, (255, 255, 255))
        draw = ImageDraw.Draw(collage)

        # Load fonts
        logger.info("Loading fonts...")
        title_font = self.font_manager.load_font("Pacifico-Regular.ttf", 60)
        caption_font = self.font_manager.load_font("Quicksand-Regular.ttf", 36)
        metadata_font = self.font_manager.load_font("Quicksand-Regular.ttf", 24)

        # Draw title
        logger.debug("Drawing title")
        next_y = self.font_manager.center_text(
            draw, collection.title, title_font, margin, collage_width, (50, 50, 50)
        )

        # Calculate image area boundaries
        image_area_top = next_y + margin
        image_area_bottom = collage_height - margin * 3

        if collection.caption or collection.location or collection.date:
            image_area_bottom -= 100  # Reserve space for caption and metadata

        # Render images section
        used_areas = self._render_images_section(
            collage,
            images,
            (margin, image_area_top, collage_width, image_area_bottom),
            min_image_size,
            max_image_size,
            corner_radius,
        )

        # Render caption if available
        next_y = image_area_bottom + margin
        if collection.caption:
            logger.debug("Drawing caption")
            next_y = (
                self.font_manager.center_text(
                    draw,
                    collection.caption,
                    caption_font,
                    next_y,
                    collage_width,
                    (50, 50, 50),
                )
                + margin
            )

        # Render metadata (location & date)
        metadata_text = self._format_metadata(collection)
        if metadata_text:
            logger.debug("Drawing metadata")
            self.font_manager.center_text(
                draw, metadata_text, metadata_font, next_y, collage_width, (80, 80, 80)
            )

        logger.success("Collage created successfully")
        return collage

    def _render_images_section(
        self,
        collage: Image.Image,
        images: list[Image.Image],
        bounds: tuple[int, int, int, int],
        min_image_size: tuple[int, int],
        max_image_size: tuple[int, int],
        corner_radius: int,
    ) -> list[tuple[int, int, int, int]]:
        """Render images in a scattered, overlapping arrangement."""
        logger.info("Placing images on canvas with artistic layout...")
        draw = ImageDraw.Draw(collage)
        used_areas = []

        # Limit to a reasonable number of images to avoid excessive overlap
        images_to_use = images[: min(15, len(images))]
        logger.info(f"Using {len(images_to_use)} images for the collage")

        for idx, image in enumerate(images_to_use):
            try:
                # Randomly determine image size within constraints
                img_width = random.randint(min_image_size[0], max_image_size[0])
                img_height = random.randint(min_image_size[1], max_image_size[1])

                # Prepare the image (resize and round corners)
                rounded_img = self.image_processor.prepare_image(
                    image, (img_width, img_height), corner_radius
                )

                # Apply random rotation (-15 to 15 degrees)
                rotation = random.randint(-15, 15)
                rotated_img = self.image_processor.rotate_image(rounded_img, rotation)

                # Find a suitable position
                position = self.image_processor.find_placement_position(
                    rotated_img.size, used_areas, bounds
                )

                if position:
                    x_offset, y_offset = position

                    # Record the position of the actual image, not the rotated bounds
                    # This prevents the "grey square" problem
                    img_rect = (
                        x_offset,
                        y_offset,
                        x_offset + rotated_img.width,
                        y_offset + rotated_img.height,
                    )
                    used_areas.append(img_rect)

                    # Paste the rotated image with transparency
                    collage.paste(rotated_img, (x_offset, y_offset), rotated_img)

                    logger.debug(
                        f"Placed image {idx} at position ({x_offset}, {y_offset}) with rotation {rotation}°"
                    )
                else:
                    logger.warning(f"Could not find suitable position for image {idx}")

            except Exception as e:
                logger.error(f"Error processing image {idx}: {str(e)}")
                continue  # Skip problematic images

        return used_areas

    def _format_metadata(self, collection: Collection) -> str:
        """Format metadata text without emojis."""
        metadata_parts = []

        if collection.location:
            metadata_parts.append(f"{collection.location}")

        if collection.date:
            try:
                metadata_parts.append(f"{collection.date.strftime('%B %d, %Y')}")
            except Exception as e:
                logger.warning(f"Error formatting date: {str(e)}")
                metadata_parts.append(f"{collection.date}")
        if len(metadata_parts) == 1:
            return metadata_parts[0]
        return " • ".join(metadata_parts) if metadata_parts else ""


# Main function to use the CollageGenerator
async def create_collage(
    collection: Collection, images: list[Image.Image], **kwargs
) -> Image.Image:
    """Creates a collage from images with title, caption, location, and date."""
    generator = CollageGenerator()
    return await generator.create_collage(collection, images, **kwargs)

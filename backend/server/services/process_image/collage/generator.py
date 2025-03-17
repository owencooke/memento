import random
from PIL import Image, ImageDraw, ImageFilter
from loguru import logger
from server.services.db.models.schema_public_latest import Collection
from server.services.process_image.collage.font_manager import FontManager
from server.services.process_image.collage.image_processor import ImageProcessor


class CollageGenerator:
    """Generator class for creating a collage/image-representation of a collection."""

    def __init__(
        self,
        canvas_size=(1170, 2532),  # iPhone 13 aspect ratio / reasonable resolution
        canvas_color=(255, 255, 255),
        min_image_size=(300, 300),
        max_image_size=(500, 500),
        margin=40,
        corner_radius=15,
        text_padding=10,
        text_bg_color=(0, 255, 255, 180),
    ):
        """Initialize the CollageGenerator."""
        self.font_manager = FontManager()
        self.image_processor = ImageProcessor()

        # Store configuration as instance variables
        self.canvas_size = canvas_size
        self.canvas_color = canvas_color
        self.min_image_size = min_image_size
        self.max_image_size = max_image_size
        self.margin = margin
        self.corner_radius = corner_radius
        self.text_padding = text_padding
        self.text_bg_color = text_bg_color

    async def create_collage(
        self, collection: Collection, images: list[Image.Image]
    ) -> Image.Image:
        """Main method for generating a new collage for a collection."""

        logger.info(f"Creating collage for collection: {collection.title}")

        # Create blank white canvas
        collage_width, collage_height = self.canvas_size
        collage = Image.new("RGB", self.canvas_size, self.canvas_color)

        # Load fonts
        logger.info("Loading fonts")
        title_font = self.font_manager.load_font("Pacifico-Regular.ttf", 60)
        caption_font = self.font_manager.load_font("Quicksand-Regular.ttf", 36)
        metadata_font = self.font_manager.load_font("Quicksand-Regular.ttf", 24)

        # Add images to collage
        self._render_images_section(collage, images)

        # Draw title with background for readability
        logger.info("Drawing title")
        self.font_manager.draw_text_with_background(
            collage,
            collection.title,
            title_font,
            self.margin,
            (50, 50, 50),
            self.text_padding,
            self.text_bg_color,
            8,
            self.margin,
        )

        # Calculate footer position
        footer_y = collage_height - self.margin * 2

        # Render caption if available
        if collection.caption:
            logger.info("Drawing caption")
            footer_y = self.font_manager.draw_text_with_background(
                collage,
                collection.caption,
                caption_font,
                footer_y,
                (50, 50, 50),
                self.text_padding,
                self.text_bg_color,
                8,
                self.margin,
            )

        # Render metadata (location & date)
        metadata_text = self._format_metadata(collection)
        if metadata_text:
            logger.info("Drawing metadata")
            self.font_manager.draw_text_with_background(
                collage,
                metadata_text,
                metadata_font,
                footer_y + self.margin,
                (80, 80, 80),
                self.text_padding,
                self.text_bg_color,
                8,
                self.margin,
            )

        logger.success("Collage created successfully")
        return collage

    def _render_images_section(
        self,
        collage: Image.Image,
        images: list[Image.Image],
    ) -> None:
        """Render images in a scattered, overlapping arrangement."""
        logger.info("Placing images on canvas...")
        used_areas = []

        # Calculate image area bounds
        margin = self.margin
        collage_width, collage_height = self.canvas_size
        bounds = (margin, margin, collage_width - margin, collage_height - margin)

        # Limit to a reasonable number of images to avoid excessive overlap
        images_to_use = images[: min(15, len(images))]
        logger.info(f"Using {len(images_to_use)} images for the collage")

        for idx, image in enumerate(images_to_use):
            try:
                # Randomly determine image size within constraints
                img_width = random.randint(
                    self.min_image_size[0], self.max_image_size[0]
                )
                img_height = random.randint(
                    self.min_image_size[1], self.max_image_size[1]
                )

                # Prepare the image (resize and round corners)
                rounded_img = self.image_processor.prepare_image(
                    image, (img_width, img_height), self.corner_radius
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

                    # Record the position of the actual image
                    img_rect = (
                        x_offset,
                        y_offset,
                        x_offset + rotated_img.width,
                        y_offset + rotated_img.height,
                    )
                    used_areas.append(img_rect)

                    # Paste the rotated image with transparency
                    collage.paste(rotated_img, (x_offset, y_offset), rotated_img)

                    logger.info(
                        f"Placed image {idx} at position ({x_offset}, {y_offset}) with rotation {rotation}°"
                    )
                else:
                    logger.warning(f"Could not find suitable position for image {idx}")

            except Exception as e:
                logger.error(f"Error processing image {idx}: {str(e)}")
                continue

    def _format_metadata(self, collection: Collection) -> str:
        """Format collection metadata fields as one text string."""
        metadata_parts = []
        if collection.location:
            metadata_parts.append(f"{collection.location}")
        if collection.date:
            metadata_parts.append(f"{collection.date.strftime('%B %d, %Y')}")
        if len(metadata_parts) == 1:
            return metadata_parts[0]
        return " • ".join(metadata_parts) if metadata_parts else ""

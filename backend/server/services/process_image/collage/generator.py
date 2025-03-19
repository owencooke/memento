import random

from loguru import logger
from PIL import Image

from server.config.types import RGB, RGBA, IntPair
from server.services.db.models.schema_public_latest import Collection
from server.services.process_image.collage.image_processor import ImageProcessor
from server.services.process_image.collage.text_manager import TextManager


class CollageGenerator:
    """Generator class for creating a collage/image-representation of a collection."""

    def __init__(
        self,
        canvas_size: IntPair = (1200, 1600),  # 4:3 aspect ratio
        canvas_color: RGB = (255, 255, 255),
        max_images_used: int = 15,
        image_radius: int = 20,
        image_coverage: float = 1.0,  # relative to size of "grid cell"
        margin: int = 40,
        text_padding: int = 10,
        text_color: RGB = (80, 80, 80),
        text_bg_color: RGBA = (0, 255, 255, 180),
    ) -> None:
        """Initialize the CollageGenerator parameters."""
        self.font_manager = TextManager(
            text_color=text_color,
            text_padding=text_padding,
            bg_color=text_bg_color,
            bg_radius=8,
            margin=margin,
        )
        self.image_processor = ImageProcessor()
        self.canvas_size = canvas_size
        self.canvas_color = canvas_color
        self.image_coverage = image_coverage
        self.margin = margin
        self.image_radius = image_radius
        self.text_padding = text_padding
        self.text_color = text_color
        self.text_bg_color = text_bg_color
        self.max_images_used = max_images_used

    async def create_collage(
        self,
        collection: Collection,
        images: list[Image.Image],
    ) -> Image.Image:
        """Main method for generating a new collage for a collection."""

        logger.info(f"Creating collage for collection: {collection.title}")

        # Create blank canvas
        collage_width, collage_height = self.canvas_size
        footer_y = collage_height - self.margin * 3
        collage = Image.new("RGB", self.canvas_size, self.canvas_color)

        # Load fonts
        logger.info("Loading fonts")
        title_font = self.font_manager.load_font("Pacifico-Regular.ttf", 60)
        caption_font = self.font_manager.load_font("Quicksand-Regular.ttf", 36)
        metadata_font = self.font_manager.load_font("Quicksand-Regular.ttf", 24)

        # Add images
        self._render_scattered_images(collage, images)

        # Add title
        logger.info("Drawing title")
        self.font_manager.draw_text_with_background(
            collage,
            collection.title,
            title_font,
            self.margin,
        )

        # Add caption
        if collection.caption:
            logger.info("Drawing caption")
            footer_y = self.font_manager.draw_text_with_background(
                collage,
                collection.caption,
                caption_font,
                footer_y,
            )

        # Add collection metadata
        metadata_text = self._format_metadata_string(collection)
        if metadata_text:
            logger.info("Drawing metadata")
            self.font_manager.draw_text_with_background(
                collage,
                metadata_text,
                metadata_font,
                footer_y - self.text_padding * 2,
            )

        logger.success("Collage created successfully")
        return collage

    def _render_scattered_images(
        self,
        collage: Image.Image,
        images: list[Image.Image],
    ) -> None:
        """Render images in a scattered grid in attempt to completely cover canvas."""

        # Limit number of images to avoid excessive overlap
        images_to_use = images[: min(self.max_images_used, len(images))]
        logger.info(f"Adding {len(images_to_use)} images to the canvas")
        cell_width, cell_height, grid_cells = self._initialize_grid(len(images_to_use))

        used_areas = []
        for idx, grid_cell in enumerate(grid_cells):
            try:
                row, col = grid_cell

                # Get image and dimensions
                coverage = random.uniform(
                    self.image_coverage,
                    self.image_coverage + 0.5,
                )
                img_width = int(cell_width * coverage)
                img_height = int(cell_height * coverage)
                rounded_img = self.image_processor.prepare_image(
                    # Repeat images until all grid cells full
                    images_to_use[idx % len(images_to_use)],
                    (img_width, img_height),
                    self.image_radius,
                )

                # Apply random rotation
                rotation = random.randint(-15, 15)
                rotated_img = self.image_processor.rotate_image(rounded_img, rotation)

                # Calculate position for image
                diagonal = (rotated_img.width**2 + rotated_img.height**2) ** 0.5
                max_shift = (diagonal - min(rotated_img.width, rotated_img.height)) / 2
                rotation_shift_x = int((rotation / 15) * max_shift * 0.5)
                rotation_shift_y = int((rotation / 15) * max_shift * 0.5)

                x_offset = col * cell_width - self.margin - rotation_shift_x
                y_offset = row * cell_height - self.margin - rotation_shift_y

                # Add the image to the canvas
                collage.paste(rotated_img, (x_offset, y_offset), rotated_img)

                logger.info(
                    f"""Placed image {idx} at cell ({row}, {col}) position
                    ({x_offset}, {y_offset}) with rotation {rotation}°""",
                )

                # Store already covered areas
                used_areas.append(
                    (
                        x_offset,
                        y_offset,
                        x_offset + rotated_img.width,
                        y_offset + rotated_img.height,
                    ),
                )

            except Exception as e:
                logger.error(f"Error processing image {idx}: {e!s}")
                continue

    def _format_metadata_string(self, collection: Collection) -> str:
        """Format collection metadata fields as one text string."""
        metadata_parts = []
        if collection.location:
            metadata_parts.append(f"{collection.location}")
        if collection.date:
            metadata_parts.append(f"{collection.date.strftime('%B %d, %Y')}")
        if len(metadata_parts) == 1:
            return metadata_parts[0]
        return " • ".join(metadata_parts) if metadata_parts else ""

    def _initialize_grid(
        self,
        num_images: int,
    ) -> tuple[int, int, list[IntPair]]:
        """Initialize a grid for image placement based on number of images."""
        grid_cols = 2
        grid_rows = 2
        if num_images > grid_cols * grid_cols:
            grid_cols = min(6, max(2, int(num_images**0.5)))
            grid_rows = min(6, max(2, (num_images + grid_cols - 1) // grid_cols))

        logger.info(f"Using grid of {grid_cols}x{grid_rows} for {num_images} images")

        # Calculate grid cell size
        overflow = self.margin * 2
        cell_width = (self.canvas_size[0] + overflow) // grid_cols
        cell_height = (self.canvas_size[1] + overflow) // grid_rows

        # Shuffle list of grid cells (for random placement)
        grid_cells = []
        for row in range(grid_rows):
            for col in range(grid_cols):
                grid_cells.append((row, col))
        random.shuffle(grid_cells)

        return cell_width, cell_height, grid_cells

import random
from PIL import Image
from loguru import logger
from server.services.db.models.schema_public_latest import Collection
from server.services.process_image.collage.text_manager import TextManager
from server.services.process_image.collage.image_processor import ImageProcessor


class CollageGenerator:
    """Generator class for creating a collage/image-representation of a collection."""

    def __init__(
        self,
        canvas_size=(1170, 2532),  # iPhone 13 aspect ratio
        canvas_color=(255, 255, 255),
        min_image_size=(700, 900),
        max_image_size=(900, 1500),
        max_images_used=15,
        image_radius=20,
        margin=40,
        text_padding=10,
        text_color=(80, 80, 80),
        text_bg_color=(0, 255, 255, 180),
    ):
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
        self.min_image_size = min_image_size
        self.max_image_size = max_image_size
        self.margin = margin
        self.image_radius = image_radius
        self.text_padding = text_padding
        self.text_color = text_color
        self.text_bg_color = text_bg_color
        self.max_images_used = max_images_used

    async def create_collage(
        self, collection: Collection, images: list[Image.Image]
    ) -> Image.Image:
        """Main method for generating a new collage for a collection."""

        logger.info(f"Creating collage for collection: {collection.title}")

        # Create blank white canvas
        collage_width, collage_height = self.canvas_size
        footer_y = collage_height - self.margin * 3
        collage = Image.new("RGB", self.canvas_size, self.canvas_color)

        # Load fonts
        logger.info("Loading fonts")
        title_font = self.font_manager.load_font("Pacifico-Regular.ttf", 60)
        caption_font = self.font_manager.load_font("Quicksand-Regular.ttf", 36)
        metadata_font = self.font_manager.load_font("Quicksand-Regular.ttf", 24)

        # Add images to collage
        self._render_scattered_images(collage, images)

        # Draw title with background for readability
        logger.info("Drawing title")
        self.font_manager.draw_text_with_background(
            collage,
            collection.title,
            title_font,
            self.margin,
        )

        # Render caption if available
        if collection.caption:
            logger.info("Drawing caption")
            footer_y = self.font_manager.draw_text_with_background(
                collage,
                collection.caption,
                caption_font,
                footer_y,
            )

        # Render collection metadata
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
        """Render images in a grid-based scattered arrangement to ensure canvas coverage."""

        # Limit number of images to avoid excessive overlap
        images_to_use = images[: min(self.max_images_used, len(images))]
        logger.info(f"Adding {len(images_to_use)} images to the canvas")
        cell_width, cell_height, grid_cells = self._initialize_grid(len(images_to_use))

        # Ensure we have at least one image per grid cell if possible
        used_areas = []
        for idx, image in enumerate(images_to_use):
            if not grid_cells:
                break

            try:
                # Get a grid cell position
                row, col = grid_cells.pop(0)

                # Calculate base position for the cell
                base_x = col * cell_width
                base_y = row * cell_height

                # Calculate cell coverage (how much of the cell should the image cover)
                # coverage = random.uniform(
                #     1.0, 1.5
                # )  # Between 100% and 150% of cell size
                coverage = 1.5

                # Determine image dimensions based on cell size and desired coverage
                img_width = int(cell_width * coverage)
                img_height = int(cell_height * coverage)

                # Prepare the image (resize and round corners)
                rounded_img = self.image_processor.prepare_image(
                    image, (img_width, img_height), self.image_radius
                )

                # Apply random rotation
                rotation = random.randint(-15, 15)
                rotated_img = self.image_processor.rotate_image(rounded_img, rotation)

                # Calculate final position with jitter
                # jitter_x = random.randint(-cell_width // 4, cell_width // 4)
                # jitter_y = random.randint(-cell_height // 4, cell_height // 4)
                # x_offset = base_x + jitter_x
                # y_offset = base_y + jitter_y
                # x_offset = base_x
                # y_offset = base_y
                rotation_shift_x = int(
                    (rotation / 30) * cell_width * 0.3
                )  # Scale the shift by rotation angle
                rotation_shift_y = int((rotation / 30) * cell_height * 0.3)

                # Apply the rotation-based compensation
                x_offset = base_x - rotation_shift_x
                y_offset = base_y - rotation_shift_y

                # Add the processed image to the canvas
                collage.paste(rotated_img, (x_offset, y_offset), rotated_img)

                logger.info(
                    f"Placed image {idx} at cell ({row}, {col}) position ({x_offset}, {y_offset}) with rotation {rotation}°"
                )

                # Store the positions of taken by images to avoid placing again
                img_rect = (
                    x_offset,
                    y_offset,
                    x_offset + rotated_img.width,
                    y_offset + rotated_img.height,
                )
                used_areas.append(img_rect)

            except Exception as e:
                logger.error(f"Error processing image {idx}: {str(e)}")
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
        self, num_images: int
    ) -> tuple[int, int, list[tuple[int, int]]]:
        """Initialize a grid for image placement based on number of images."""
        grid_cols = 2
        grid_rows = 2

        # Adjust grid dimensions based on image count
        if num_images > 4:
            grid_cols = min(4, max(2, int(num_images**0.5)))
            grid_rows = min(4, max(2, (num_images + grid_cols - 1) // grid_cols))

        logger.info(f"Using grid of {grid_cols}x{grid_rows} for {num_images} images")

        # Calculate cell dimensions with extended canvas area
        overflow = self.margin * 2
        cell_width = (self.canvas_size[0] + overflow) // grid_cols
        cell_height = (self.canvas_size[1] + overflow) // grid_rows

        # Create a list of all grid cells with offset starting position
        grid_cells = []
        for row in range(grid_rows):
            for col in range(grid_cols):
                # Shift the starting position left/up by margin amount
                grid_cells.append((row, col))

        # Shuffle the grid cells for random placement
        random.shuffle(grid_cells)

        return cell_width, cell_height, grid_cells

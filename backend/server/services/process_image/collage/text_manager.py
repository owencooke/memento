from pathlib import Path

from loguru import logger
from PIL import Image, ImageDraw, ImageFont

from server.config.settings import ROOT_DIR
from server.config.types import RGB, RGBA, Font


class TextManager:
    """Manages font loading and text operations."""

    def __init__(
        self,
        text_color: RGB = (80, 80, 80),
        text_padding: int = 10,
        bg_color: RGBA = (0, 255, 255, 180),
        bg_radius: int = 8,
        margin: int = 40,
    ) -> None:
        """Initialize TextManager parameters."""
        self.text_color = text_color
        self.text_padding = text_padding
        self.bg_color = bg_color
        self.bg_radius = bg_radius
        self.margin = margin

    def load_font(
        self,
        font_name: str,
        size: int,
    ) -> Font:
        """Attempts to load a font; falls back to default with detailed logging."""
        font_path = ROOT_DIR / "assets" / "fonts" / font_name
        try:
            if Path.exists(font_path):
                return ImageFont.truetype(font_path, size)
            logger.warning(
                f"Font file not found at {font_path}, falling back to default",
            )
        except Exception as e:
            logger.error(f"Error loading font {font_name}: {e!s}")
        return ImageFont.load_default()

    def draw_text_with_background(
        self,
        image: Image.Image,
        text: str,
        font: Font,
        y_position: float,
    ) -> float:
        """Draw text with a semi-transparent background for better readability."""
        draw = ImageDraw.Draw(image, "RGBA")
        canvas_width = image.width

        # Get the full bounding box
        left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
        text_width = right - left
        text_height = bottom - top

        # Calculate positions accounting for the offsets
        x_position = (canvas_width - text_width) // 2
        bg_left = x_position - self.text_padding
        bg_top = y_position - self.text_padding
        bg_right = x_position + text_width + self.text_padding
        bg_bottom = y_position + text_height + self.text_padding

        # Add background
        draw.rounded_rectangle(
            [bg_left, bg_top, bg_right, bg_bottom],
            radius=self.bg_radius,
            fill=self.bg_color,
        )

        # Add text, adjusting for the left and top offsets
        draw.text(
            (x_position - left, y_position - top),
            text,
            fill=self.text_color,
            font=font,
        )
        return bg_bottom + self.margin

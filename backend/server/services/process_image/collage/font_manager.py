import os
from PIL import ImageDraw, ImageFont, Image
from loguru import logger
from server.config.settings import ROOT_DIR


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

    @staticmethod
    def draw_text_with_background(
        image: Image.Image,
        text: str,
        font: ImageFont.FreeTypeFont,
        y_position: int,
        text_color: tuple,
        text_padding: int = 10,
        bg_color: tuple = (0, 255, 255, 180),
        bg_radius: int = 8,
        margin: int = 40,
    ) -> int:
        """Draw text with a semi-transparent background for better readability.

        Args:
            image: The image to draw on
            text: The text to render
            font: Font to use for the text
            y_position: Vertical position to start drawing
            text_color: Color of the text (RGB tuple)
            text_padding: Padding around the text inside background
            bg_color: Background color with alpha (RGBA tuple)
            bg_radius: Border radius for the background rectangle
            margin: Margin to add after text for next element spacing

        Returns:
            int: The Y position for the next element
        """
        draw = ImageDraw.Draw(image, "RGBA")
        canvas_width = image.width

        # Calculate text dimensions
        text_width, text_height = FontManager.get_text_dimensions(draw, text, font)

        # Center text horizontally
        x_position = (canvas_width - text_width) // 2

        # Create background rectangle with padding
        bg_left = x_position - text_padding
        bg_top = y_position - text_padding
        bg_right = x_position + text_width + text_padding
        bg_bottom = y_position + text_height + text_padding

        # Draw text background
        draw.rounded_rectangle(
            [bg_left, bg_top, bg_right, bg_bottom], radius=bg_radius, fill=bg_color
        )

        # Draw the text
        draw.text((x_position, y_position), text, fill=text_color, font=font)

        # Return the Y position for the next element
        return bg_bottom + margin

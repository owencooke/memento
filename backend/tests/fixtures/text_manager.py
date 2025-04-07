from unittest.mock import MagicMock

import pytest
from PIL import ImageDraw, ImageFont

from server.config.types import Font


@pytest.fixture
def pil_font() -> Font:
    """Create a mock PIL Font object."""
    return MagicMock(spec=ImageFont.FreeTypeFont)


@pytest.fixture
def pil_draw() -> ImageDraw:
    """Create a mock PIL ImageDraw object."""
    draw = MagicMock(spec=ImageDraw.Draw)
    draw.textbbox.return_value = (5, 5, 100, 30)  # left, top, right, bottom
    return draw

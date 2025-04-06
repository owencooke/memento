import binascii
import datetime
from typing import Any, Dict
from unittest.mock import MagicMock, patch

import numpy as np
import pytest
from PIL import ImageDraw, ImageFont

from server.config.settings import ROOT_DIR
from server.config.types import RGB, RGBA, Font, IntPair
from server.services.db.models.schema_public_latest import Collection


@pytest.fixture
def pil_font() -> Font:
    """Create a mock PIL Font object."""
    font = MagicMock(spec=ImageFont.FreeTypeFont)
    return font


@pytest.fixture
def pil_draw() -> ImageDraw:
    """Create a mock PIL ImageDraw object."""
    draw = MagicMock(spec=ImageDraw.Draw)
    draw.textbbox.return_value = (5, 5, 100, 30)  # left, top, right, bottom
    return draw

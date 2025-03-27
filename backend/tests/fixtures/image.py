from unittest.mock import MagicMock

import pytest
from PIL import Image


@pytest.fixture
def image_data() -> dict:
    """Common base data for image tests."""
    return {
        "filename": "image",
        "order_index": 0,
        "memento_id": 1,
    }


@pytest.fixture
def expected_image_data() -> dict:
    """Expected Supabase response for mock DB fields of image data.

    Fields must be in JSON-applicable format, not Python types (how Supabase responds).
    """
    return {
        "id": 1,
        "filename": "image",
        "order_index": 0,
        "memento_id": 1,
        "detected_text": None,
        "image_label": None,
        "mime_type": "image/jpeg",
        "coordinates": None,
        "date": None,
    }


@pytest.fixture
def mock_pil_image() -> MagicMock:
    """Creates a mock PIL Image object for testing."""
    mock_image = MagicMock(spec=Image.Image)
    mock_image.size = (800, 600)
    mock_image.mode = "RGBA"
    return mock_image

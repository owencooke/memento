import binascii
import datetime
from typing import Any, Dict
from unittest.mock import MagicMock, patch

import numpy as np
import pytest
from PIL import Image, ImageDraw, ImageFont
from pydantic import ValidationError

from server.config.settings import ROOT_DIR
from server.config.types import RGB, RGBA, Font, IntPair
from server.services.db.models.schema_public_latest import Collection


@pytest.fixture
def coordinates_data() -> Dict[str, float]:
    """Return test data for Coordinates."""
    return {"lat": 37.7749, "long": -122.4194}


@pytest.fixture
def geojson_point() -> Dict[str, Any]:
    """Return a valid GeoJSON point."""
    return {
        "type": "Point",
        "coordinates": [-122.4194, 37.7749],  # [longitude, latitude]
    }


@pytest.fixture
def postgis_hex() -> str:
    """Return a mock PostGIS hex string for a point."""
    return "0101000020E6100000CB10C7BAB65F5EC06D37C1374D374240"


# @pytest.fixture
# def collection() -> Collection:
#     """Return a mock Collection object."""
#     collection = MagicMock(spec=Collection)
#     collection.title = "Test Collection"
#     collection.caption = "Test Caption"
#     collection.location = "Test Location"
#     collection.date = datetime.date(2023, 1, 1)
#     return collection
#
#

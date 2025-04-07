from typing import Any, Dict

import pytest


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

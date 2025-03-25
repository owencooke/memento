from datetime import date

import pytest

from server.services.db.models.gis import Coordinates


@pytest.fixture
def memento_data():
    """Common base data for memento tests."""
    return {
        "id": 1,
        "caption": "Test Memento",
        "location": "Poole, UK",
        "coordinates": Coordinates(lat=42, long=-71),
        "date": date(2023, 1, 1),
    }


@pytest.fixture
def expected_memento_data():
    """Common expected response fields for memento tests."""
    return {
        "id": 1,
        "caption": "Test Memento",
        "location": "Poole, UK",
        "date": date(2023, 1, 1).isoformat(),
        "coordinates": "0101000020E61000009BA9108FC4CBFFBF9D8026C2865B4940",
    }

import uuid
from datetime import date

import pytest

from server.services.db.models.gis import Coordinates


@pytest.fixture
def memento_data() -> dict:
    """Common base data for memento tests."""
    return {
        "id": 1,
        "caption": "Test Memento",
        "location": "Poole, UK",
        "coordinates": Coordinates(lat=42, long=-71),
        "date": date(2023, 1, 1),
        "user_id": uuid.UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8"),
    }


@pytest.fixture
def expected_memento_data() -> dict:
    """Expected Supabase response for mock DB fields of memento data above.

    Fields must be in JSON-applicable format, not Python types (how Supabase responds).
    """
    return {
        "id": 1,
        "caption": "Test Memento",
        "location": "Poole, UK",
        "date": date(2023, 1, 1).isoformat(),
        "coordinates": "0101000020E61000009BA9108FC4CBFFBF9D8026C2865B4940",
        "user_id": "35b25fe2-08cc-42f6-902c-9eec499d04e8",
    }

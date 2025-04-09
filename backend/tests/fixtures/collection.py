import uuid
from datetime import date

import pytest

from server.services.db.models.gis import Coordinates
from server.services.db.models.schema_public_latest import Collection


@pytest.fixture
def collection() -> Collection:
    """Creates a collection model with test data."""
    return Collection(
        id=1,
        title="Test Collection",
        caption="Test Caption",
        location="Test Location",
        date=date(2023, 1, 1),
        user_id=uuid.UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8"),
    )


@pytest.fixture
def collection_data() -> dict:
    """Common base data for collection tests."""
    return {
        "id": 1,
        "title": "Test Collection",
        "caption": "Test Caption",
        "location": "Poole, UK",
        "coordinates": Coordinates(lat=42, long=-71),
        "date": date(2023, 1, 1),
        "user_id": uuid.UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8"),
    }


@pytest.fixture
def expected_collection_data() -> dict:
    """Expected Supabase response for mock DB fields of collection data above.

    Fields must be in JSON-applicable format, not Python types (how Supabase responds).
    """
    return {
        "id": 1,
        "title": "Test Collection",
        "caption": "Test Caption",
        "location": "Poole, UK",
        "date": date(2023, 1, 1).isoformat(),
        "coordinates": "0101000020E61000009BA9108FC4CBFFBF9D8026C2865B4940",
        "user_id": "35b25fe2-08cc-42f6-902c-9eec499d04e8",
    }


@pytest.fixture
def has_memento_data() -> dict:
    """Common base data for has_memento association tests."""
    return {
        "collection_id": 1,
        "memento_id": 2,
    }


@pytest.fixture
def collections_with_mementos_data() -> list[dict]:
    """Test data for collections with associated mementos."""
    return [
        {
            "id": 1,
            "title": "Collection 1",
            "caption": "Caption 1",
            "location": "Poole, UK",
            "coordinates": "0101000020E61000009BA9108FC4CBFFBF9D8026C2865B4940",
            "date": date(2023, 1, 1).isoformat(),
            "user_id": "35b25fe2-08cc-42f6-902c-9eec499d04e8",
            "mementos": [
                {"collection_id": 1, "memento_id": 1},
                {"collection_id": 1, "memento_id": 2},
            ],
        },
        {
            "id": 2,
            "title": "Collection 2",
            "caption": "Caption 2",
            "location": "London, UK",
            "coordinates": "0101000020E61000009BA9108FC4CBFFBF9D8026C2865B4940",
            "date": date(2023, 2, 1).isoformat(),
            "user_id": "35b25fe2-08cc-42f6-902c-9eec499d04e8",
            "mementos": [{"collection_id": 2, "memento_id": 3}],
        },
    ]


@pytest.fixture
def associated_memento_ids() -> list[dict]:
    """Test data for memento IDs associated with a collection."""
    return [
        {"memento_id": 1},
        {"memento_id": 2},
        {"memento_id": 3},
    ]

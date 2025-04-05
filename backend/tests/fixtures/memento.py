import uuid
from datetime import date, timedelta

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


@pytest.fixture
def memento_with_images_data() -> dict:
    """Fixture for memento with images data."""
    return {
        "id": 1,
        "caption": "Test Memento",
        "location": "Poole, UK",
        "coordinates": "0101000020E61000009BA9108FC4CBFFBF9D8026C2865B4940",
        "date": date(2023, 1, 1).isoformat(),
        "user_id": "35b25fe2-08cc-42f6-902c-9eec499d04e8",
        "images": [
            {
                "id": 1,
                "memento_id": 1,
                "filename": "test_image.jpg",
                "mime_type": "image/jpeg",
                "order_index": 0,
                "coordinates": None,
                "date": None,
                "detected_text": "Sample text",
                "image_label": "mountain_view",
                "url": "https://example.com/image1.jpg",
            },
        ],
    }


@pytest.fixture
def multiple_mementos_with_images_data() -> list[dict]:
    """Fixture for multiple mementos with images data."""
    user_id = "35b25fe2-08cc-42f6-902c-9eec499d04e8"
    base_date = date(2023, 1, 1)

    return [
        {
            "id": 1,
            "caption": "Mountain Trip",
            "location": "Colorado",
            # approx 42N, -71E
            "coordinates": "0101000020E61000009BA9108FC4CBFFBF9D8026C2865B4940",
            "date": base_date.isoformat(),
            "user_id": user_id,
            "images": [
                {
                    "id": 1,
                    "memento_id": 1,
                    "filename": "mountains.jpg",
                    "mime_type": "image/jpeg",
                    "order_index": 0,
                    "coordinates": None,
                    "date": None,
                    "detected_text": "Rocky mountains hiking trail",
                    "image_label": "mountain_view",
                    "url": "https://example.com/mountains.jpg",
                },
            ],
        },
        {
            "id": 2,
            "caption": "Beach Day",
            "location": "Miami",
            # approx 30N, -85E
            "coordinates": "0101000020E6100000A01A2FDD24B055C05C8FC2F528DC3D40",
            "date": (base_date + timedelta(days=30)).isoformat(),
            "user_id": user_id,
            "images": [
                {
                    "id": 2,
                    "memento_id": 2,
                    "filename": "beach.jpg",
                    "mime_type": "image/jpeg",
                    "order_index": 0,
                    "coordinates": None,
                    "date": None,
                    "detected_text": "Sunny beach day",
                    "image_label": "beach",
                    "url": "https://example.com/beach.jpg",
                },
                {
                    "id": 3,
                    "memento_id": 2,
                    "filename": "sunset.jpg",
                    "mime_type": "image/jpeg",
                    "order_index": 1,
                    "coordinates": None,
                    "date": None,
                    "detected_text": "Beautiful sunset",
                    "image_label": "sunset",
                    "url": "https://example.com/sunset.jpg",
                },
            ],
        },
        {
            "id": 3,
            "caption": "City Tour",
            "location": "New York",
            # approx 45N, -83E
            "coordinates": "0101000020E61000003333333333B354C066666666664E4240",
            "date": (base_date + timedelta(days=60)).isoformat(),
            "user_id": user_id,
            "images": [
                {
                    "id": 4,
                    "memento_id": 3,
                    "filename": "city.jpg",
                    "mime_type": "image/jpeg",
                    "order_index": 0,
                    "coordinates": None,
                    "date": None,
                    "detected_text": "Manhattan skyline",
                    "image_label": "cityscape",
                    "url": "https://example.com/city.jpg",
                },
            ],
        },
    ]

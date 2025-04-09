import uuid

import pytest

from server.api.memento.models import MementoWithCoordinates
from server.services.db.models.gis import Coordinates


@pytest.fixture
def sample_mementos() -> list[MementoWithCoordinates]:
    """Fixture providing sample mementos with coordinates for testing."""
    return [
        MementoWithCoordinates(
            id=1,
            user_id=uuid.UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8"),
            coordinates=Coordinates(lat=37.7749, long=-122.4194),
        ),
        MementoWithCoordinates(
            id=2,
            user_id=uuid.UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8"),
            coordinates=Coordinates(lat=37.7748, long=-122.4193),
        ),
        MementoWithCoordinates(
            id=3,
            user_id=uuid.UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8"),
            coordinates=Coordinates(lat=37.7750, long=-122.4195),
        ),
        MementoWithCoordinates(
            id=4,
            user_id=uuid.UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8"),
            coordinates=Coordinates(lat=40.7128, long=-74.0060),
        ),
        MementoWithCoordinates(
            id=5,
            user_id=uuid.UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8"),
            coordinates=Coordinates(lat=40.7129, long=-74.0061),
        ),
        MementoWithCoordinates(
            id=6,
            user_id=uuid.UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8"),
            coordinates=Coordinates(lat=34.0522, long=-118.2437),
        ),
    ]

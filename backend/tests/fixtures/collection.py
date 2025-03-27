from datetime import date
from uuid import UUID

import pytest

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
        user_id=UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8"),
    )

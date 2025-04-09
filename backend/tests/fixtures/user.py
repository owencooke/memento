from datetime import date
from uuid import UUID

import pytest


@pytest.fixture
def user_info_fixture() -> tuple[UUID, date]:
    """Fixture providing common user ID and birthday for tests."""
    return UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8"), date(2002, 1, 1)

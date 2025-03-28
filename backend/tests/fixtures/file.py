from unittest.mock import AsyncMock

import pytest
from fastapi import UploadFile


@pytest.fixture
def mock_upload_file() -> AsyncMock:
    """Creates a mock UploadFile object for testing."""
    mock_file = AsyncMock(spec=UploadFile)
    mock_file.read.return_value = b"test image data"
    return mock_file

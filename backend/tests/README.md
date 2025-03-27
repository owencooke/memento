# Backend Tests

Some of the Python code for enabling backend white box testing via Pytest was written with the help of Generative AI and iterated upon to improve the quality of the resulting tests and code. The prompts and output are cited below.

LLM Model used: Claude 3.7 Sonnet

## Prompt

### User Input

how can i test this query using pytest? while mocking the supabase query methods to return some fixed response data?

```python
from pydantic import UUID4

from server.api.memento.models import MementoFilterParams, NewMemento, UpdateMemento
from server.services.db.config import supabase
from server.services.db.models.joins import MementoWithImages
from server.services.db.models.schema_public_latest import Memento


def create_memento(new_memento: NewMemento, user_id: UUID4) -> Memento:
    """Creates a new memento for a user."""
    response = (
        supabase.table("memento")
        .insert({**new_memento.model_dump(mode="json"), "user_id": str(user_id)})
        .execute()
    )
    return Memento(**response.data[0])
```

### LLM Output

I'll create a test for the create_memento function using pytest and mocking the supabase methods:

```python
import uuid
from datetime import date, datetime
from unittest.mock import MagicMock, Mock, patch

import pytest
from pydantic import UUID4

from server.api.memento.models import MementoFilterParams, NewMemento, UpdateMemento
from server.services.db.models.joins import MementoWithImages
from server.services.db.models.schema_public_latest import Memento
from server.services.db.queries.memento import create_memento, get_mementos, update_memento


@pytest.fixture
def mock_supabase():
    with patch("server.services.db.queries.memento.supabase") as mock_supabase:
        # Set up the mock chaining for all our methods
        mock_table = MagicMock()
        mock_select = MagicMock()
        mock_insert = MagicMock()
        mock_update = MagicMock()
        mock_eq = MagicMock()
        mock_in = MagicMock()
        mock_gte = MagicMock()
        mock_lte = MagicMock()
        mock_text_search = MagicMock()
        mock_execute = MagicMock()
        mock_rpc = MagicMock()

        # Set up the chain
        mock_supabase.table.return_value = mock_table
        mock_table.select.return_value = mock_select
        mock_table.insert.return_value = mock_insert
        mock_table.update.return_value = mock_update
        mock_select.eq.return_value = mock_eq
        mock_eq.execute.return_value = mock_execute
        mock_eq.gte.return_value = mock_gte
        mock_eq.lte.return_value = mock_lte
        mock_eq.text_search.return_value = mock_text_search
        mock_eq.in_.return_value = mock_in
        mock_gte.gte.return_value = mock_gte
        mock_gte.lte.return_value = mock_lte
        mock_gte.text_search.return_value = mock_text_search
        mock_gte.in_.return_value = mock_in
        mock_gte.execute.return_value = mock_execute
        mock_lte.in_.return_value = mock_in
        mock_lte.text_search.return_value = mock_text_search
        mock_lte.execute.return_value = mock_execute
        mock_text_search.in_.return_value = mock_in
        mock_text_search.execute.return_value = mock_execute
        mock_in.execute.return_value = mock_execute
        mock_update.eq.return_value = mock_eq
        mock_supabase.rpc.return_value = mock_rpc
        mock_rpc.execute.return_value = mock_execute

        yield mock_supabase, mock_execute


def test_create_memento(mock_supabase):
    # Unpack the mock objects
    mock_supabase_client, mock_execute = mock_supabase

    # Setup test data
    user_id = UUID4(uuid.uuid4())
    new_memento_data = {
        "title": "Test Memento",
        "description": "Test description",
        "location": "Test location",
        "date": date(2023, 1, 1),
        "latitude": 42.0,
        "longitude": -71.0
    }
    new_memento = NewMemento(**new_memento_data)

    # Setup mock response
    expected_response = {
        "id": 1,
        "user_id": str(user_id),
        "title": "Test Memento",
        "description": "Test description",
        "location": "Test location",
        "date": "2023-01-01",
        "latitude": 42.0,
        "longitude": -71.0,
        "created_at": "2023-01-01T00:00:00",
        "updated_at": "2023-01-01T00:00:00"
    }
    mock_execute.data = [expected_response]

    # Call the function
    result = create_memento(new_memento, user_id)

    # Assertions
    mock_supabase_client.table.assert_called_once_with("memento")
    mock_supabase_client.table().insert.assert_called_once()

    # Check the result is a Memento object with the expected data
    assert isinstance(result, Memento)
    assert result.id == 1
    assert result.title == "Test Memento"
    assert result.user_id == str(user_id)
```

## Prompt

### User Input

that's not the appropriate solution based on your code. we need to be able to access any of the insert/update/select/ return values.

is there a way we can consolidate the mock expected response for any query form? (regardless of whether its select or uses condition like eq or condiitons like insert)

I just want to be able to mock the expected response from supabase

### LLM Output

You're right - we need a more flexible mocking approach that allows us to set the mock response regardless of the query chain. Let me create a cleaner solution:

```python
import uuid
from datetime import date, datetime
from unittest.mock import MagicMock, Mock, patch

import pytest
from pydantic import UUID4

from server.api.memento.models import MementoFilterParams, NewMemento, UpdateMemento
from server.services.db.models.joins import MementoWithImages
from server.services.db.models.schema_public_latest import Memento
from server.services.db.queries.memento import (
    create_memento,
    get_mementos,
    update_memento,
)


@pytest.fixture
def mock_supabase():
    """Create a mock supabase client that returns predetermined responses."""
    with patch("server.services.db.queries.memento.supabase") as mock_supabase:
        # Create a mock response object that can be configured in each test
        mock_response = MagicMock()

        # Create mock chain builders - each returns a mockable execute method
        def create_chain_builder():
            chain_builder = MagicMock()
            chain_builder.execute.return_value = mock_response

            # Make chain methods return themselves to allow method chaining
            chain_methods = ['select', 'insert', 'update', 'delete', 'eq', 'neq',
                           'gt', 'gte', 'lt', 'lte', 'like', 'ilike',
                           'is_', 'in_', 'text_search', 'not_', 'or_', 'filter']
            for method in chain_methods:
                getattr(chain_builder, method).return_value = chain_builder

            return chain_builder

        # Set up table access
        mock_table = create_chain_builder()
        mock_supabase.table.return_value = mock_table

        # Set up RPC calls
        mock_rpc = create_chain_builder()
        mock_supabase.rpc.return_value = mock_rpc

        yield mock_supabase, mock_response


def test_create_memento(mock_supabase):
    # Unpack the mock objects
    mock_supabase_client, mock_response = mock_supabase

    # Setup test data
    user_id = uuid.uuid4()
    new_memento_data = {
        "caption": "Test Memento",
        "location": "Test location",
        "date": date(2023, 1, 1),
        "latitude": 42.0,
        "longitude": -71.0,
    }
    new_memento = NewMemento(**new_memento_data)

    # Setup mock response
    expected_response = {
        "id": 1,
        "user_id": str(user_id),
        "caption": "Test Memento",
        "location": "Poole, UK",
        "date": "2023-01-01",
        "coordinates": "0101000020E61000009BA9108FC4CBFFBF9D8026C2865B4940",
        # Add any other fields required by your Memento model
    }
    mock_response.data = [expected_response]

    # Call the function
    result = create_memento(new_memento, user_id)

    # Assertions
    mock_supabase_client.table.assert_called_once_with("memento")

    # Check the result is a Memento object with the expected data
    assert isinstance(result, Memento)
    assert result.id == 1
    # Use the correct field from your model - either title or caption
    if hasattr(result, "caption"):
        assert result.caption == "Test Memento"
    else:
        assert result.title == "Test Memento"
    assert result.user_id == str(user_id)

```

## Prompt

### User Input

copy my approach from test_memento and fixtures/memento. Use a similar approach for writing pytest tests for the methods in this file (the image DB table queries)

your goal should be to make the fixtures and test structure as similar as possible to the tests for mementos.

### LLM Output

Based on your request, I'll create tests for the image query methods that follow the same structure as your test_memento.py file, using the existing mock_supabase fixture. Here's the implementation:

```python
from server.api.memento.models import NewImageMetadata
from server.services.db.models.joins import ImageWithUrl
from server.services.db.queries.image import (
    create_image_metadata,
    get_images_for_memento,
    delete_image_metadata,
    update_image_order,
)
from tests.fixtures.supabase import MockSupabase


def test_create_image_metadata(
    mock_supabase: MockSupabase,
    image_data: dict,
    expected_image_data: dict,
) -> None:
    """Test creating a new image metadata record for a memento."""
    mock_supabase_client, mock_query_response = mock_supabase

    # Given
    mock_image = NewImageMetadata(**image_data)
    memento_id = 1
    mock_query_response.data = [expected_image_data]

    # When
    result = create_image_metadata(mock_image, memento_id)

    # Then
    mock_supabase_client.table.assert_called_once_with("image")
    mock_supabase_client.table().insert.assert_called_once()
    assert result is True


def test_get_images_for_memento(
    mock_supabase: MockSupabase,
    expected_image_data: dict,
) -> None:
    """Test retrieving all images belonging to a memento."""
    mock_supabase_client, mock_query_response = mock_supabase

    # Given
    memento_id = 1
    mock_query_response.data = [expected_image_data]

    # When
    results = get_images_for_memento(memento_id)

    # Then
    mock_supabase_client.table.assert_called_once_with("image")
    mock_supabase_client.table().select.assert_called_once_with("*")
    mock_supabase_client.table().select().eq.assert_called_once_with("memento_id", memento_id)
    assert len(results) == 1
    assert isinstance(results[0], ImageWithUrl)
    assert results[0].id == expected_image_data["id"]
    assert results[0].url == expected_image_data["url"]
    assert results[0].memento_id == expected_image_data["memento_id"]


def test_delete_image_metadata(
    mock_supabase: MockSupabase,
    expected_image_data: dict,
) -> None:
    """Test deleting an image metadata record."""
    mock_supabase_client, mock_query_response = mock_supabase

    # Given
    image_id = 1
    mock_query_response.data = [expected_image_data]

    # When
    result = delete_image_metadata(image_id)

    # Then
    mock_supabase_client.table.assert_called_once_with("image")
    mock_supabase_client.table().delete.assert_called_once()
    mock_supabase_client.table().delete().eq.assert_called_once_with("id", image_id)
    assert result is True


def test_update_image_order(
    mock_supabase: MockSupabase,
    expected_image_data: dict,
) -> None:
    """Test updating an image's order index."""
    mock_supabase_client, mock_query_response = mock_supabase

    # Given
    image_id = 1
    new_order_index = 2
    mock_query_response.data = [expected_image_data]

    # When
    result = update_image_order(image_id, new_order_index)

    # Then
    mock_supabase_client.table.assert_called_once_with("image")
    mock_supabase_client.table().update.assert_called_once_with({"order_index": new_order_index})
    mock_supabase_client.table().update().eq.assert_called_once_with("id", image_id)
    assert result is True


import pytest


@pytest.fixture
def image_data() -> dict:
    """Common base data for image tests."""
    return {
        "url": "https://example.com/image.jpg",
        "bucket_path": "mementos/user123/image.jpg",
        "order_index": 0,
        "memento_id": 1
    }


@pytest.fixture
def expected_image_data() -> dict:
    """Expected Supabase response for mock DB fields of image data.

    Fields must be in JSON-applicable format, not Python types (how Supabase responds).
    """
    return {
        "id": 1,
        "url": "https://example.com/image.jpg",
        "bucket_path": "mementos/user123/image.jpg",
        "order_index": 0,
        "memento_id": 1,
        "detected_text": None,
        "filename": "image.jpg",
        "image_label": None,
        "mime_type": "image/jpeg",
        "coordinates": None,
        "date": None
    }
```

## Prompt

your last tests for the methods in image.py were great. I want you to repeat the same process for testing the functions in storage/image.py

use the given/when/then pattern like before. use the mock supabase fixture we have already defined.

### LLM Output

I'll create tests for the functions in image.py using the same structure and approach as before. Here's my implementation:

```python
import io
import uuid
from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest
from fastapi import UploadFile
from PIL import Image

from server.services.storage.image import (
    delete_images,
    download_images,
    get_bulk_image_urls,
    get_image_url,
    upload_image,
)
from tests.fixtures.supabase import MockSupabase


@pytest.mark.asyncio
async def test_upload_image(mock_supabase: MockSupabase) -> None:
    """Test uploading an image to Supabase storage."""
    mock_supabase_client, _ = mock_supabase

    # Given
    expected_path = "test-uuid-path"
    mock_file = AsyncMock(spec=UploadFile)
    mock_file.content_type = "image/jpeg"
    mock_file.read.return_value = b"test image content"

    mock_upload_response = MagicMock()
    mock_upload_response.path = expected_path
    mock_supabase_client.storage.from_().upload.return_value = mock_upload_response

    with patch("server.services.storage.image.uuid.uuid4", return_value=expected_path):
        # When
        result = await upload_image(mock_file)

    # Then
    mock_supabase_client.storage.from_.assert_called_once_with("images")
    mock_supabase_client.storage.from_().upload.assert_called_once_with(
        file=b"test image content",
        path=expected_path,
        file_options={"content-type": "image/jpeg"},
    )
    assert result == expected_path


def test_delete_images(mock_supabase: MockSupabase) -> None:
    """Test deleting images from Supabase storage."""
    mock_supabase_client, _ = mock_supabase

    # Given
    test_filenames = ["image1.jpg"]
    mock_supabase_client.storage.from_().remove.return_value = ["image1.jpg"]

    # When
    result = delete_images(test_filenames)

    # Then
    mock_supabase_client.storage.from_.assert_called_once_with("images")
    mock_supabase_client.storage.from_().remove.assert_called_once_with(test_filenames)
    assert result is True


def test_get_image_url(mock_supabase: MockSupabase) -> None:
    """Test getting a signed URL for a single image."""
    mock_supabase_client, _ = mock_supabase

    # Given
    test_filename = "image1.jpg"
    expected_url = "https://example.com/signed-url"
    mock_supabase_client.storage.from_().create_signed_url.return_value = {
        "signedUrl": expected_url
    }

    # When
    result = get_image_url(test_filename)

    # Then
    mock_supabase_client.storage.from_.assert_called_once_with("images")
    mock_supabase_client.storage.from_().create_signed_url.assert_called_once_with(
        test_filename, 86400
    )
    assert result == expected_url


def test_get_bulk_image_urls(mock_supabase: MockSupabase) -> None:
    """Test getting signed URLs for multiple images."""
    mock_supabase_client, _ = mock_supabase

    # Given
    test_filenames = ["image1.jpg", "image2.jpg"]
    mock_response = [
        {"path": "image1.jpg", "signedUrl": "https://example.com/signed-url-1"},
        {"path": "image2.jpg", "signedUrl": "https://example.com/signed-url-2"},
    ]
    mock_supabase_client.storage.from_().create_signed_urls.return_value = mock_response

    # When
    result = get_bulk_image_urls(test_filenames)

    # Then
    mock_supabase_client.storage.from_.assert_called_once_with("images")
    mock_supabase_client.storage.from_().create_signed_urls.assert_called_once_with(
        test_filenames, 86400
    )
    assert result == {
        "image1.jpg": "https://example.com/signed-url-1",
        "image2.jpg": "https://example.com/signed-url-2",
    }


def test_get_bulk_image_urls_empty(mock_supabase: MockSupabase) -> None:
    """Test getting signed URLs with empty filenames list."""
    mock_supabase_client, _ = mock_supabase

    # Given
    test_filenames = []

    # When
    result = get_bulk_image_urls(test_filenames)

    # Then
    mock_supabase_client.storage.from_.assert_not_called()
    assert result == {}


def test_download_images(mock_supabase: MockSupabase) -> None:
    """Test downloading images from Supabase storage."""
    mock_supabase_client, _ = mock_supabase

    # Given
    test_filenames = ["image1.jpg", "image2.jpg"]
    mock_image = MagicMock(spec=Image.Image)

    with patch("server.services.storage.image.io.BytesIO") as mock_bytesio:
        with patch("server.services.storage.image.Image.open") as mock_image_open:
            mock_image_open.return_value = mock_image
            mock_image.convert.return_value = mock_image
            mock_supabase_client.storage.from_().download.return_value = b"test image data"

            # When
            result = download_images(test_filenames)

    # Then
    assert mock_supabase_client.storage.from_.call_count == 2
    assert mock_supabase_client.storage.from_().download.call_count == 2
    assert len(result) == 2
    assert all(isinstance(img, MagicMock) for img in result)


def test_download_images_with_error(mock_supabase: MockSupabase) -> None:
    """Test downloading images with one failing."""
    mock_supabase_client, _ = mock_supabase

    # Given
    test_filenames = ["valid.jpg", "error.jpg"]
    mock_image = MagicMock(spec=Image.Image)

    def side_effect(filename):
        if filename == "error.jpg":
            raise Exception("Test error")
        return b"test image data"

    with patch("server.services.storage.image.io.BytesIO") as mock_bytesio:
        with patch("server.services.storage.image.Image.open") as mock_image_open:
            with patch("server.services.storage.image.logger") as mock_logger:
                mock_image_open.return_value = mock_image
                mock_image.convert.return_value = mock_image
                mock_supabase_client.storage.from_().download.side_effect = side_effect

                # When
                result = download_images(test_filenames)

    # Then
    assert mock_supabase_client.storage.from_.call_count == 2
    assert mock_supabase_client.storage.from_().download.call_count == 2
    assert len(result) == 1  # Only one image should be returned
    mock_logger.info.assert_called_once()  # Error should be logged
```

<!-- ## Prompt -->

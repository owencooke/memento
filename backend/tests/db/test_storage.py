from unittest.mock import AsyncMock, patch

import pytest
from fastapi import UploadFile

from server.services.storage.image import (
    upload_image,
)
from tests.fixtures.supabase import MockSupabase


@pytest.mark.asyncio
async def test_upload_image(mock_supabase: MockSupabase) -> None:
    """Test uploading an image to Supabase storage."""
    mock_supabase_client, _, mock_storage_response = mock_supabase

    # Given
    expected_path = "test-uuid-path"
    mock_file = AsyncMock(spec=UploadFile)
    mock_file.content_type = "image/jpeg"
    mock_file.read.return_value = b"test image content"

    # Set the expected path on the storage response
    mock_storage_response.path = expected_path

    with patch("server.services.storage.image.uuid.uuid4", return_value=expected_path):
        # When
        actual_path = await upload_image(mock_file)

    # Then
    mock_supabase_client.storage.from_.assert_called_once_with("images")
    mock_supabase_client.storage.from_().upload.assert_called_once_with(
        file=mock_file.read.return_value,
        path=expected_path,
        file_options={"content-type": mock_file.content_type},
    )
    assert actual_path == expected_path


# def test_delete_images(mock_supabase: MockSupabase) -> None:
#     """Test deleting images from Supabase storage."""
#     mock_supabase_client, _ = mock_supabase

#     # Given
#     test_filenames = ["image1.jpg"]
#     mock_supabase_client.storage.from_().remove.return_value = ["image1.jpg"]

#     # When
#     result = delete_images(test_filenames)

#     # Then
#     mock_supabase_client.storage.from_.assert_called_once_with("images")
#     mock_supabase_client.storage.from_().remove.assert_called_once_with(test_filenames)
#     assert result is True


# def test_get_image_url(mock_supabase: MockSupabase) -> None:
#     """Test getting a signed URL for a single image."""
#     mock_supabase_client, _ = mock_supabase

#     # Given
#     test_filename = "image1.jpg"
#     expected_url = "https://example.com/signed-url"
#     mock_supabase_client.storage.from_().create_signed_url.return_value = {
#         "signedUrl": expected_url
#     }

#     # When
#     result = get_image_url(test_filename)

#     # Then
#     mock_supabase_client.storage.from_.assert_called_once_with("images")
#     mock_supabase_client.storage.from_().create_signed_url.assert_called_once_with(
#         test_filename, 86400
#     )
#     assert result == expected_url


# def test_get_bulk_image_urls(mock_supabase: MockSupabase) -> None:
#     """Test getting signed URLs for multiple images."""
#     mock_supabase_client, _ = mock_supabase

#     # Given
#     test_filenames = ["image1.jpg", "image2.jpg"]
#     mock_response = [
#         {"path": "image1.jpg", "signedUrl": "https://example.com/signed-url-1"},
#         {"path": "image2.jpg", "signedUrl": "https://example.com/signed-url-2"},
#     ]
#     mock_supabase_client.storage.from_().create_signed_urls.return_value = mock_response

#     # When
#     result = get_bulk_image_urls(test_filenames)

#     # Then
#     mock_supabase_client.storage.from_.assert_called_once_with("images")
#     mock_supabase_client.storage.from_().create_signed_urls.assert_called_once_with(
#         test_filenames, 86400
#     )
#     assert result == {
#         "image1.jpg": "https://example.com/signed-url-1",
#         "image2.jpg": "https://example.com/signed-url-2",
#     }


# def test_get_bulk_image_urls_empty(mock_supabase: MockSupabase) -> None:
#     """Test getting signed URLs with empty filenames list."""
#     mock_supabase_client, _ = mock_supabase

#     # Given
#     test_filenames = []

#     # When
#     result = get_bulk_image_urls(test_filenames)

#     # Then
#     mock_supabase_client.storage.from_.assert_not_called()
#     assert result == {}


# def test_download_images(mock_supabase: MockSupabase) -> None:
#     """Test downloading images from Supabase storage."""
#     mock_supabase_client, _ = mock_supabase

#     # Given
#     test_filenames = ["image1.jpg", "image2.jpg"]
#     mock_image = MagicMock(spec=Image.Image)

#     with patch("server.services.storage.image.io.BytesIO") as mock_bytesio:
#         with patch("server.services.storage.image.Image.open") as mock_image_open:
#             mock_image_open.return_value = mock_image
#             mock_image.convert.return_value = mock_image
#             mock_supabase_client.storage.from_().download.return_value = (
#                 b"test image data"
#             )

#             # When
#             result = download_images(test_filenames)

#     # Then
#     assert mock_supabase_client.storage.from_.call_count == 2
#     assert mock_supabase_client.storage.from_().download.call_count == 2
#     assert len(result) == 2
#     assert all(isinstance(img, MagicMock) for img in result)

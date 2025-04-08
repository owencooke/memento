from io import BytesIO
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from PIL import Image

from server.services.process_image.converters import (
    pil_to_png_bytes,
    upload_file_to_pil,
)


@pytest.mark.asyncio
async def test_upload_file_to_pil(
    mock_upload_file: AsyncMock,
    mock_pil_image: MagicMock,
) -> None:
    """Test converting an upload file to a PIL image."""
    # Given
    with patch(
        "server.services.process_image.converters.BytesIO",
    ) as mock_bytesio, patch(
        "server.services.process_image.converters.Image.open",
    ) as mock_image_open:
        mock_instance = mock_bytesio.return_value
        mock_image_open.return_value = mock_pil_image
        # When
        result = await upload_file_to_pil(mock_upload_file)

    # Then
    mock_upload_file.read.assert_called_once()
    mock_bytesio.assert_called_once_with(b"test image data")
    mock_image_open.assert_called_once_with(mock_instance)
    assert result == mock_pil_image


@pytest.mark.asyncio
async def test_pil_to_png_bytes_no_resize(mock_pil_image: MagicMock) -> None:
    """Test converting PIL image to PNG bytes without needing to resize."""
    # Given
    mock_buffer = MagicMock(spec=BytesIO)
    mock_buffer.tell.return_value = 300 * 1024  # below 500KB threshold
    expected_bytes = b"test png data"
    mock_buffer.getvalue.return_value = expected_bytes

    with patch(
        "server.services.process_image.converters.BytesIO",
    ) as mock_bytesio, patch(
        "server.services.process_image.converters.logger",
    ) as mock_logger:
        mock_bytesio.return_value = mock_buffer
        # When
        result = await pil_to_png_bytes(mock_pil_image)

    # Then
    mock_bytesio.assert_called_once()
    mock_pil_image.save.assert_called_once_with(
        mock_buffer,
        format="PNG",
        compress_level=6,
    )
    mock_buffer.tell.assert_called_once()
    mock_logger.debug.assert_called_once()
    assert result == expected_bytes


@pytest.mark.asyncio
async def test_pil_to_png_bytes_with_resize(mock_pil_image: MagicMock) -> None:
    """Test converting PIL image to PNG bytes with resizing for large images.

    First call over size limit, second call under limit
    """
    # Given
    mock_buffer = MagicMock(spec=BytesIO)
    mock_buffer.tell.side_effect = [600 * 1024, 450 * 1024]
    expected_bytes = b"test png data resized"
    mock_buffer.getvalue.return_value = expected_bytes

    resized_image = MagicMock(spec=Image.Image)
    mock_pil_image.resize.return_value = resized_image

    with patch(
        "server.services.process_image.converters.BytesIO",
    ) as mock_bytesio, patch(
        "server.services.process_image.converters.logger",
    ) as mock_logger:
        mock_bytesio.return_value = mock_buffer
        # When
        result = await pil_to_png_bytes(mock_pil_image)

    # Then
    assert mock_bytesio.call_count == 1
    assert mock_buffer.tell.call_count == 2
    assert mock_logger.info.call_count == 2
    mock_pil_image.resize.assert_called_once()
    assert mock_pil_image.save.call_count == 1
    assert resized_image.save.call_count == 1
    assert result == expected_bytes

from unittest.mock import MagicMock, patch

import pytest
from PIL import Image

from server.services.process_image.background import remove_background


@pytest.mark.asyncio
async def test_remove_background(mock_pil_image: MagicMock) -> None:
    """Test removing background from an image."""
    # Given
    mock_removed_image = MagicMock(spec=Image.Image)
    mock_converted_image = MagicMock(spec=Image.Image)
    mock_cropped_image = MagicMock(spec=Image.Image)

    # Setup the chain of operations
    mock_removed_image.convert.return_value = mock_converted_image
    mock_converted_image.crop.return_value = mock_cropped_image

    # When
    with patch("server.services.process_image.background.remove") as mock_remove:
        mock_remove.return_value = mock_removed_image
        result = await remove_background(mock_pil_image)

    # Then
    mock_remove.assert_called_once_with(mock_pil_image)
    mock_removed_image.convert.assert_called_once()  # Check convert was called
    mock_converted_image.crop.assert_called_once()  # Check crop was called
    assert result == mock_cropped_image  # Fi


@pytest.mark.asyncio
async def test_remove_background_exception_thrown(mock_pil_image: MagicMock) -> None:
    """Test error handling when background removal fails."""
    # Given
    error_msg = "Failed to remove background from image"
    with patch("server.services.process_image.background.remove") as mock_remove:
        mock_remove.side_effect = Exception(error_msg)

        # When
        with pytest.raises(Exception) as exc_info:
            await remove_background(mock_pil_image)

    # Then
    assert str(exc_info.value) == error_msg

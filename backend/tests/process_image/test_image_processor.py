from unittest.mock import MagicMock, patch

import pytest
from PIL import Image, ImageDraw, ImageOps

from server.services.process_image.collage.image_processor import ImageProcessor


class TestImageProcessor:
    """Test suite for ImageProcessor class."""

    def test_init(self):
        """Test initialization creates an instance."""
        processor = ImageProcessor()
        assert isinstance(processor, ImageProcessor)

    def test_prepare_image_success(self, mock_pil_image):
        """Test prepare_image method successfully resizes and adds rounded corners."""
        processor = ImageProcessor()
        target_size = (200, 200)
        corner_radius = 10

        # Mock dependencies
        with patch(
            "PIL.ImageOps.fit", return_value=mock_pil_image
        ) as mock_fit, patch.object(Image, "new") as mock_new_image, patch(
            "PIL.ImageDraw.Draw", return_value=MagicMock()
        ) as mock_draw:

            # Configure mock_new_image to return a mock image
            mock_new_image.return_value = mock_pil_image

            # Call the method
            result = processor.prepare_image(mock_pil_image, target_size, corner_radius)

            # Assert
            mock_fit.assert_called_once_with(
                mock_pil_image, target_size, Image.Resampling.LANCZOS
            )
            assert mock_new_image.call_count == 2
            mock_draw.assert_called_once()
            mock_pil_image.paste.assert_called_once()
            assert result == mock_pil_image

    def test_prepare_image_exception(self, mock_pil_image):
        """Test prepare_image method handles exceptions properly."""
        processor = ImageProcessor()
        target_size = (200, 200)
        corner_radius = 10

        # Mock ImageOps.fit to raise an exception
        with patch("PIL.ImageOps.fit", side_effect=Exception("Test error")), patch(
            "loguru.logger.error"
        ) as mock_logger:

            # Call the method and assert it raises
            with pytest.raises(Exception, match="Test error"):
                processor.prepare_image(mock_pil_image, target_size, corner_radius)

            # Verify error logging
            mock_logger.assert_called_once()

    def test_prepare_image_rounded_corners(self, mock_pil_image):
        """Test prepare_image method properly creates rounded corners."""
        processor = ImageProcessor()
        target_size = (200, 200)
        corner_radius = 15

        # Mock the Image and ImageDraw objects
        mock_resized = MagicMock(spec=Image.Image)
        mock_rounded = MagicMock(spec=Image.Image)
        mock_mask = MagicMock(spec=Image.Image)
        mock_draw = MagicMock(spec=ImageDraw.Draw)

        # Ensure mock_draw has rounded_rectangle method
        mock_draw.rounded_rectangle = MagicMock()

        with patch("PIL.ImageOps.fit", return_value=mock_resized) as mock_fit, patch(
            "PIL.Image.new"
        ) as mock_new, patch(
            "PIL.ImageDraw.Draw", return_value=mock_draw
        ) as mock_draw_create:

            # Configure mock_new to return different values on each call
            mock_new.side_effect = [mock_rounded, mock_mask]

            # Call the method
            result = processor.prepare_image(mock_pil_image, target_size, corner_radius)

            # Assert
            mock_fit.assert_called_once_with(
                mock_pil_image, target_size, Image.Resampling.LANCZOS
            )
            mock_new.assert_any_call(
                "RGBA", target_size, (0, 0, 0, 0)
            )  # First call creates rounded image
            mock_new.assert_any_call("L", target_size, 0)  # Second call creates mask
            mock_draw_create.assert_called_once_with(mock_mask)
            mock_draw.rounded_rectangle.assert_called_once_with(
                (0, 0, target_size[0], target_size[1]), corner_radius, fill=255
            )
            mock_rounded.paste.assert_called_once_with(mock_resized, (0, 0), mock_mask)
            assert result == mock_rounded

    def test_rotate_image_success(self, mock_pil_image):
        """Test rotate_image method successfully rotates an image."""
        processor = ImageProcessor()
        angle = 45

        # Configure mock to return itself for mode check and rotate
        mock_pil_image.mode = "RGBA"
        mock_pil_image.rotate.return_value = mock_pil_image

        # Call the method
        result = processor.rotate_image(mock_pil_image, angle)

        # Assert
        mock_pil_image.convert.assert_not_called()  # Already RGBA
        mock_pil_image.rotate.assert_called_once_with(
            angle, expand=True, resample=Image.Resampling.BICUBIC
        )
        assert result == mock_pil_image

    def test_rotate_image_convert_to_rgba(self, mock_pil_image):
        """Test rotate_image method converts to RGBA if needed."""
        processor = ImageProcessor()
        angle = 30

        # Configure mock for non-RGBA mode
        mock_pil_image.mode = "RGB"
        mock_pil_image.convert.return_value = mock_pil_image
        mock_pil_image.rotate.return_value = mock_pil_image

        # Call the method
        result = processor.rotate_image(mock_pil_image, angle)

        # Assert
        mock_pil_image.convert.assert_called_once_with("RGBA")
        mock_pil_image.rotate.assert_called_once()
        assert result == mock_pil_image

    def test_rotate_image_exception(self, mock_pil_image):
        """Test rotate_image method handles exceptions properly."""
        processor = ImageProcessor()
        angle = 45

        # Configure mock to raise exception
        mock_pil_image.mode = "RGBA"
        mock_pil_image.rotate.side_effect = Exception("Rotation error")

        with patch("loguru.logger.error") as mock_logger:
            # Call the method and assert it raises
            with pytest.raises(Exception, match="Rotation error"):
                processor.rotate_image(mock_pil_image, angle)

            # Verify error logging
            mock_logger.assert_called_once()

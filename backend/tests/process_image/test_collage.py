# ruff: noqa: SLF001
from unittest.mock import MagicMock, patch

import pytest
from PIL import Image

from server.services.db.models.schema_public_latest import Collection
from server.services.process_image.collage.generator import CollageGenerator
from server.services.process_image.collage.image_processor import ImageProcessor
from server.services.process_image.collage.text_manager import TextManager


class TestCollageGenerator:
    """Tests for the CollageGenerator class."""

    @pytest.mark.asyncio
    async def test_create_collage(
        self,
        collection: Collection,
        mock_pil_image: MagicMock,
    ) -> None:
        """Test the create_collage method."""
        # Given
        generator = CollageGenerator()
        mock_images = [mock_pil_image, mock_pil_image]  # Two test images
        with patch("PIL.Image.new", return_value=mock_pil_image):
            # Mock internal methods
            generator._render_scattered_images = MagicMock()
            generator._format_metadata_string = MagicMock(return_value="Test Metadata")
            generator.font_manager.load_font = MagicMock()
            generator.font_manager.draw_text_with_background = MagicMock(
                return_value=500,
            )

            # When
            result = await generator.create_collage(collection, mock_images)

            # Then
            generator._render_scattered_images.assert_called_once_with(
                mock_pil_image,
                mock_images,
            )
            generator.font_manager.load_font.assert_called()
            generator.font_manager.draw_text_with_background.assert_called()
            assert result == mock_pil_image

    def test_format_metadata_string(self, collection: Collection) -> None:
        """Test _format_metadata_string method."""
        # Given
        generator = CollageGenerator()

        # When
        result = generator._format_metadata_string(collection)

        # Then
        assert "Test Location" in result
        assert "January 01, 2023" in result
        assert " • " in result

    def test_format_metadata_string_single_item(self, collection: Collection) -> None:
        """Test _format_metadata_string with only location."""
        # Given
        generator = CollageGenerator()
        collection.date = None

        # When
        result = generator._format_metadata_string(collection)

        # Then
        assert result == "Test Location"
        assert " • " not in result

    def test_format_metadata_string_empty(self) -> None:
        """Test _format_metadata_string with no metadata."""
        # Given
        generator = CollageGenerator()
        collection = MagicMock(spec=Collection)
        collection.location = None
        collection.date = None

        # When
        result = generator._format_metadata_string(collection)

        # Then
        assert result == ""

    def test_initialize_grid(self) -> None:
        """Test _initialize_grid method."""
        # Given
        generator = CollageGenerator()
        num_images = 9

        # When
        cell_width, cell_height, grid_cells = generator._initialize_grid(num_images)

        # Then
        assert cell_width > 0
        assert cell_height > 0
        assert len(grid_cells) == 9  # Should create a 3x3 grid for 9 images
        assert isinstance(grid_cells[0], tuple)
        assert len(grid_cells[0]) == 2  # (row, col)

    def test_render_scattered_images(
        self,
        mock_pil_image: MagicMock,
    ) -> None:
        """Test _render_scattered_images method."""
        # Given
        collage = mock_pil_image
        generator = CollageGenerator()
        mock_images = [mock_pil_image] * 5

        # Mock dependencies
        generator._initialize_grid = MagicMock(
            return_value=(100, 100, [(0, 0), (0, 1), (1, 0), (1, 1), (2, 0)]),
        )
        generator.image_processor.prepare_image = MagicMock(return_value=mock_pil_image)
        generator.image_processor.rotate_image = MagicMock(return_value=mock_pil_image)
        mock_pil_image.width = 100
        mock_pil_image.height = 100

        # When
        generator._render_scattered_images(collage, mock_images)

        # Then
        generator._initialize_grid.assert_called_once_with(5)
        assert generator.image_processor.prepare_image.call_count == 5
        assert generator.image_processor.rotate_image.call_count == 5
        assert collage.paste.call_count == 5

    def test_render_scattered_images_exception_handling(
            self,
            mock_pil_image: MagicMock,
        ) -> None:
        """Test that exceptions in the _render_scattered_images method are handled properly."""

        # Given
        collage = mock_pil_image
        generator = CollageGenerator()
        mock_images = [mock_pil_image] * 5

        # Mock dependencies
        generator._initialize_grid = MagicMock(
            return_value=(100, 100, [(0, 0), (0, 1), (1, 0), (1, 1), (2, 0)]),
        )
        generator.image_processor.prepare_image = MagicMock(side_effect=Exception("Image processing error"))
        generator.image_processor.rotate_image = MagicMock(return_value=mock_pil_image)
        mock_pil_image.width = 100
        mock_pil_image.height = 100

        # When
        generator._render_scattered_images(collage, mock_images)

        # Then
        # Check that prepare_image raised an exception and the error was logged, 
        # but the process continued for the next image
        generator._initialize_grid.assert_called_once_with(5)
        assert generator.image_processor.prepare_image.call_count == 5  # It tried to call 5 times
        assert generator.image_processor.rotate_image.call_count == 0  # rotate_image should not be called if prepare_image fails


class TestImageProcessor:
    """Tests for the ImageProcessor class."""

    def test_prepare_image(self, mock_pil_image: MagicMock) -> None:
        """Test prepare_image method."""
        # Given
        processor = ImageProcessor()
        target_size = (200, 200)
        corner_radius = 10

        # Mock dependencies
        with patch("PIL.ImageOps.fit") as mock_fit, patch(
            "PIL.Image.new",
        ) as mock_new, patch("PIL.ImageDraw.Draw"):
            mock_fit.return_value = mock_pil_image
            mock_rounded = MagicMock(spec=Image.Image)
            mock_mask = MagicMock(spec=Image.Image)
            mock_new.side_effect = [mock_rounded, mock_mask]

            # When
            result = processor.prepare_image(
                mock_pil_image,
                target_size,
                corner_radius,
            )

            # Then
            mock_fit.assert_called_once()
            mock_new.assert_called()
            mock_rounded.paste.assert_called_once()
            assert result == mock_rounded

    def test_rotate_image(self, mock_pil_image: MagicMock) -> None:
        """Test rotate_image method."""
        # Given
        processor = ImageProcessor()
        angle = 15
        mock_pil_image.rotate.return_value = mock_pil_image

        # When
        result = processor.rotate_image(mock_pil_image, angle)

        # Then
        mock_pil_image.rotate.assert_called_once_with(
            angle,
            expand=True,
            resample=Image.Resampling.BICUBIC,
        )
        assert result == mock_pil_image


class TestTextManager:
    """Tests for the TextManager class."""

    def test_load_font(self) -> None:
        """Test load_font method for Pacifico font used."""
        # Given
        text_manager = TextManager()
        with patch("PIL.ImageFont.truetype") as mock_truetype:
            # When
            result = text_manager.load_font("Pacifico-Regular.ttf", 24)

        # Then
        mock_truetype.assert_called_once()
        assert result == mock_truetype.return_value

    def test_draw_text_with_background(self, mock_pil_image: MagicMock) -> None:
        """Test draw_text_with_background method."""
        # Given
        text_manager = TextManager()
        y_position = 100
        mock_draw = MagicMock()
        with patch("PIL.ImageDraw.Draw", return_value=mock_draw):
            mock_draw.textbbox.return_value = (0, 0, 100, 20)

            # When
            result = text_manager.draw_text_with_background(
                mock_pil_image,
                "Test Text",
                MagicMock(),
                y_position,
            )

            # Then
            mock_draw.textbbox.assert_called_once()
            mock_draw.rounded_rectangle.assert_called_once()
            mock_draw.text.assert_called_once()

            # Should return a y position below the original (for next draw)
            assert result > y_position

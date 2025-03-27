from unittest.mock import MagicMock, patch

import pytest
from PIL import Image

from server.services.db.models.schema_public_latest import Collection
from server.services.process_image.collage.generator import CollageGenerator
from server.services.process_image.collage.image_processor import ImageProcessor
from server.services.process_image.collage.text_manager import TextManager


@pytest.fixture
def mock_pil_objects():
    """Mock various PIL-related objects and functions."""
    with patch("PIL.Image.new") as mock_image_new:
        mock_collage = MagicMock(spec=Image.Image)
        mock_image_new.return_value = mock_collage
        yield {
            "new": mock_image_new,
            "collage": mock_collage,
        }


class TestCollageGenerator:
    """Tests for the CollageGenerator class."""

    def test_init(self):
        """Test CollageGenerator initialization."""
        # Given
        canvas_size = (1000, 1200)
        canvas_color = (200, 200, 200)

        # When
        generator = CollageGenerator(
            canvas_size=canvas_size,
            canvas_color=canvas_color,
        )

        # Then
        assert generator.canvas_size == canvas_size
        assert generator.canvas_color == canvas_color
        assert isinstance(generator.font_manager, TextManager)
        assert isinstance(generator.image_processor, ImageProcessor)

    @pytest.mark.asyncio
    async def test_create_collage(
        self,
        collection,
        mock_pil_image,
        mock_pil_objects,
    ):
        """Test the create_collage method."""
        # Given
        generator = CollageGenerator()
        mock_images = [mock_pil_image, mock_pil_image]  # Two test images

        # Mock internal methods
        generator._render_scattered_images = MagicMock()
        generator._format_metadata_string = MagicMock(return_value="Test Metadata")
        generator.font_manager.load_font = MagicMock()
        generator.font_manager.draw_text_with_background = MagicMock(
            return_value=500,
        )  # Mocked y position

        # When
        result = await generator.create_collage(collection, mock_images)

        # Then
        mock_pil_objects["new"].assert_called_once()
        generator._render_scattered_images.assert_called_once_with(
            mock_pil_objects["collage"],
            mock_images,
        )
        generator.font_manager.load_font.assert_called()
        generator.font_manager.draw_text_with_background.assert_called()
        assert result == mock_pil_objects["collage"]

    def test_format_metadata_string(self, collection: Collection):
        """Test _format_metadata_string method."""
        # Given
        generator = CollageGenerator()

        # When
        result = generator._format_metadata_string(collection)

        # Then
        assert "Test Location" in result
        assert "January 01, 2023" in result
        assert " • " in result

    def test_format_metadata_string_single_item(self, collection: Collection):
        """Test _format_metadata_string with only location."""
        # Given
        generator = CollageGenerator()
        collection.date = None

        # When
        result = generator._format_metadata_string(collection)

        # Then
        assert result == "Test Location"
        assert " • " not in result

    def test_format_metadata_string_empty(self):
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

    def test_initialize_grid(self):
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

    def test_render_scattered_images(self, mock_pil_image, mock_pil_objects):
        """Test _render_scattered_images method."""
        # Given
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
        generator._render_scattered_images(mock_pil_objects["collage"], mock_images)

        # Then
        generator._initialize_grid.assert_called_once_with(5)
        assert generator.image_processor.prepare_image.call_count == 5
        assert generator.image_processor.rotate_image.call_count == 5
        assert mock_pil_objects["collage"].paste.call_count == 5


class TestImageProcessor:
    """Tests for the ImageProcessor class."""

    def test_prepare_image(self, mock_pil_image):
        """Test prepare_image method."""
        # Given
        processor = ImageProcessor()
        target_size = (200, 200)
        corner_radius = 10

        # Mock dependencies
        with patch("PIL.ImageOps.fit") as mock_fit:
            with patch("PIL.Image.new") as mock_new:
                with patch("PIL.ImageDraw.Draw") as mock_draw:
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

    def test_rotate_image(self, mock_pil_image):
        """Test rotate_image method."""
        # Given
        processor = ImageProcessor()
        angle = 15

        # Mock the rotate method
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

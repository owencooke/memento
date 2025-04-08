from unittest.mock import MagicMock, patch

from PIL import ImageFont

from server.services.process_image.collage.text_manager import TextManager


class TestTextManager:
    """Test suite for TextManager class."""

    def test_init_with_defaults(self) -> None:
        """Test initialization with default parameters."""
        text_manager = TextManager()
        assert text_manager.text_color == (80, 80, 80)
        assert text_manager.text_padding == 10
        assert text_manager.bg_color == (0, 255, 255, 180)
        assert text_manager.bg_radius == 8
        assert text_manager.margin == 40

    def test_init_with_custom_values(self) -> None:
        """Test initialization with custom parameters."""
        text_manager = TextManager(
            text_color=(255, 0, 0),
            text_padding=20,
            bg_color=(0, 0, 255, 150),
            bg_radius=15,
            margin=30,
        )
        assert text_manager.text_color == (255, 0, 0)
        assert text_manager.text_padding == 20
        assert text_manager.bg_color == (0, 0, 255, 150)
        assert text_manager.bg_radius == 15
        assert text_manager.margin == 30

    def test_load_font_success(self) -> None:
        """Test load_font method successfully loads a font."""
        with patch("PIL.ImageFont.truetype") as mock_truetype, patch(
            "pathlib.Path.exists",
            return_value=True,
        ):
            mock_font = MagicMock(spec=ImageFont.FreeTypeFont)
            mock_truetype.return_value = mock_font

            text_manager = TextManager()
            font = text_manager.load_font("Pacifico-Regular.ttf", 96)

            mock_truetype.assert_called_once()
            assert font == mock_font

    def test_load_font_not_found(self) -> None:
        """Test load_font method when font file doesn't exist."""
        with patch("PIL.ImageFont.truetype") as mock_truetype, patch(
            "pathlib.Path.exists",
            return_value=False,
        ), patch("PIL.ImageFont.load_default") as mock_default:
            mock_default_font = MagicMock(spec=ImageFont.FreeTypeFont)
            mock_default.return_value = mock_default_font

            text_manager = TextManager()
            font = text_manager.load_font("NonExistentFont.ttf", 96)

            mock_truetype.assert_not_called()
            mock_default.assert_called_once()
            assert font == mock_default_font

    def test_load_font_error(self) -> None:
        """Test load_font method when an error occurs loading the font."""
        with patch("PIL.ImageFont.truetype", side_effect=OSError("Font error")), patch(
            "pathlib.Path.exists",
            return_value=True,
        ), patch("PIL.ImageFont.load_default") as mock_default:
            mock_default_font = MagicMock(spec=ImageFont.FreeTypeFont)
            mock_default.return_value = mock_default_font

            text_manager = TextManager()
            font = text_manager.load_font("ErrorFont.ttf", 96)

            mock_default.assert_called_once()
            assert font == mock_default_font

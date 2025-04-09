from unittest.mock import MagicMock, patch

import numpy as np

from server.services.process_image.image_class import predict_class


class TestImageClassification:
    """Test suite for image classification functions."""

    def test_predict_class(
        self,
        numpy_image: np.ndarray,
        mock_pil_image: MagicMock,
    ) -> None:
        """Test predict_class function with a valid image."""
        numpy_image = np.zeros((224, 224, 3), dtype=np.uint8)

        # Mock the necessary components
        with patch("cv2.cvtColor", return_value=numpy_image) as mock_cvtcolor, patch(
            "cv2.resize",
            return_value=numpy_image,
        ) as mock_resize, patch(
            "server.services.process_image.image_class.image.img_to_array",
            return_value=np.zeros((224, 224, 3)),
        ) as mock_img_to_array, patch(
            "numpy.expand_dims",
            return_value=np.zeros((1, 224, 224, 3)),
        ) as mock_expand_dims, patch(
            "server.services.process_image.image_class.preprocess_input",
        ) as mock_preprocess, patch(
            "server.services.process_image.image_class.decode_predictions",
        ) as mock_decode:

            # Create a mock model with a predict function
            mock_model = MagicMock()
            mock_model.predict.return_value = np.array(
                [[0.8] + [0.1] * 999],
            )  # Shape (1, 1000)

            # Mock the model in the actual function
            with patch("server.services.process_image.image_class.model", mock_model):
                # Set up mocks
                mock_pil_image.size = (300, 200)
                mock_pil_image.mode = "RGB"
                mock_pil_image.convert.return_value = mock_pil_image

                # Convert PIL to numpy array
                np_arr = np.array(numpy_image)

                # Create a properly sized padded image for the test
                padded_image = np.zeros((224, 224, 3), dtype=np.uint8)

                with patch("numpy.array", return_value=np_arr), patch(
                    "numpy.zeros",
                    return_value=padded_image,
                ):
                    # Mock prediction results
                    mock_decode.return_value = [[("n01234567", "dog", 0.8)]]

                    # Call the function
                    result = predict_class(mock_pil_image)

                    # Assert
                    mock_cvtcolor.assert_called_once()
                    mock_resize.assert_called_once()
                    mock_img_to_array.assert_called_once()
                    mock_expand_dims.assert_called_once()
                    mock_preprocess.assert_called_once()
                    mock_model.predict.assert_called_once()
                    mock_decode.assert_called_once()
                    assert result == "dog"

    def test_predict_class_wide_image(
        self,
        numpy_image: np.ndarray,
        mock_pil_image: MagicMock,
    ) -> None:
        """Test predict_class function with a wide image."""
        numpy_image = np.zeros((224, 224, 3), dtype=np.uint8)

        # Mock the necessary components
        with patch("cv2.cvtColor", return_value=numpy_image) as _, patch(
            "cv2.resize",
            return_value=numpy_image,
        ) as mock_resize, patch(
            "server.services.process_image.image_class.image.img_to_array",
            return_value=np.zeros((224, 224, 3)),
        ) as _, patch(
            "numpy.expand_dims",
            return_value=np.zeros((1, 224, 224, 3)),
        ) as _, patch(
            "server.services.process_image.image_class.preprocess_input",
        ) as _, patch(
            "server.services.process_image.image_class.decode_predictions",
        ) as mock_decode:

            # Create a mock model with a predict function
            mock_model = MagicMock()
            mock_model.predict.return_value = np.array(
                [[0.7] + [0.2] * 999],
            )  # Shape (1, 1000)

            # Mock the model in the actual function
            with patch("server.services.process_image.image_class.model", mock_model):
                # Set up mocks for wide image
                mock_pil_image.size = (400, 100)  # Wide image
                np_arr = np.array(numpy_image)

                # Create a properly sized padded image for the test
                padded_image = np.zeros((224, 224, 3), dtype=np.uint8)

                with patch("numpy.array", return_value=np_arr), patch(
                    "numpy.zeros",
                    return_value=padded_image,
                ):
                    # Mock prediction results
                    mock_decode.return_value = [[("n01234568", "cat", 0.7)]]

                    # Call the function
                    result = predict_class(mock_pil_image)

                    # Verify resize was called with correct parameters
                    # (maintaining aspect ratio)
                    mock_resize.assert_called_once()
                    assert result == "cat"

    def test_predict_class_tall_image(
        self,
        numpy_image: np.ndarray,
        mock_pil_image: MagicMock,
    ) -> None:
        """Test predict_class function with a tall image."""
        numpy_image = np.zeros((224, 224, 3), dtype=np.uint8)

        # Mock the necessary components
        with patch("cv2.cvtColor", return_value=numpy_image) as _, patch(
            "cv2.resize",
            return_value=numpy_image,
        ) as mock_resize, patch(
            "server.services.process_image.image_class.image.img_to_array",
            return_value=np.zeros((224, 224, 3)),
        ) as _, patch(
            "numpy.expand_dims",
            return_value=np.zeros((1, 224, 224, 3)),
        ) as _, patch(
            "server.services.process_image.image_class.preprocess_input",
        ) as _, patch(
            "server.services.process_image.image_class.decode_predictions",
        ) as mock_decode:

            # Create a mock model with a predict function
            mock_model = MagicMock()
            mock_model.predict.return_value = np.array(
                [[0.9] + [0.05] * 999],
            )  # Shape (1, 1000)

            with patch("server.services.process_image.image_class.model", mock_model):
                # Set up mocks for tall image
                mock_pil_image.size = (100, 400)  # Tall image
                np_arr = np.array(numpy_image)

                # Create a properly sized padded image for the test
                padded_image = np.zeros((224, 224, 3), dtype=np.uint8)

                with patch("numpy.array", return_value=np_arr), patch(
                    "numpy.zeros",
                    return_value=padded_image,
                ):
                    # Mock prediction results
                    mock_decode.return_value = [[("n01234569", "bird", 0.9)]]

                    # Call the function
                    result = predict_class(mock_pil_image)

                    # Verify resize was called with correct parameters
                    # (maintaining aspect ratio)
                    mock_resize.assert_called_once()
                    assert result == "bird"

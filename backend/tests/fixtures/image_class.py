import numpy as np
import pytest


@pytest.fixture
def numpy_image() -> np.ndarray:
    """Create a mock numpy image array."""
    return np.zeros((100, 100, 3), dtype=np.uint8)


@pytest.fixture
def keras_prediction() -> np.ndarray:
    """Create a mock Keras prediction array.

    Format: [[(node_id, class_name, probability)]]
    """
    return np.array([[("n01234567", "dog", 0.95)]])

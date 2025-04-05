import uuid
from unittest.mock import MagicMock, patch

import numpy as np

from server.api.memento.models import MementoWithCoordinates
from server.services.cluster_memento.hdbscan import cluster_mementos
from server.services.db.models.gis import Coordinates


def test_cluster_mementos_success(
    sample_mementos: list[MementoWithCoordinates],
) -> None:
    """Test successful clustering of mementos."""
    # When
    result = cluster_mementos(sample_mementos, min_cluster_size=2)

    # Then
    # Should have at least one cluster
    assert len(result) > 0
    # All clusters should have at least min_cluster_size elements
    for _, memento_ids in result.items():
        assert len(memento_ids) >= 2


def test_cluster_mementos_not_enough_mementos() -> None:
    """Test behavior when there are fewer mementos than min_cluster_size."""
    # Given
    mementos = [
        MementoWithCoordinates(
            id=1,
            user_id=uuid.UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8"),
            coordinates=Coordinates(lat=37.7749, long=-122.4194),
        ),
        MementoWithCoordinates(
            id=2,
            user_id=uuid.UUID("35b25fe2-08cc-42f6-902c-9eec499d04e8"),
            coordinates=Coordinates(lat=40.7128, long=-74.0060),
        ),
    ]

    # When
    result = cluster_mementos(mementos, min_cluster_size=5)

    # Then
    assert -1 in result
    assert result[-1] == [1, 2]


@patch("server.services.cluster_memento.hdbscan.HDBSCAN")
def test_cluster_mementos_parameters(
    mock_hdbscan: MagicMock,
    sample_mementos: list[MementoWithCoordinates],
) -> None:
    """Test that HDBSCAN is initialized with the correct parameters."""
    # Setup mock
    mock_hdbscan_instance = mock_hdbscan.return_value
    mock_hdbscan_instance.fit_predict.return_value = np.array([0, 0, 0, 1, 1, -1])

    # When
    result = cluster_mementos(
        sample_mementos,
        min_cluster_size=3,
        min_samples=2,
        allow_single_cluster=False,
        prediction_data=True,
    )

    # Then
    mock_hdbscan.assert_called_once_with(
        min_cluster_size=3,
        min_samples=2,
        allow_single_cluster=False,
        prediction_data=True,
    )

    # Verify results based on mocked HDBSCAN output
    assert 0 in result
    assert 1 in result
    assert result[0] == [1, 2, 3]
    assert result[1] == [4, 5]
    # Memento 6 with ID 6 should not be in any cluster because it's labeled as noise
    assert 6 not in [id for cluster in result.values() for id in cluster]


def test_cluster_mementos_with_custom_params(
    sample_mementos: list[MementoWithCoordinates],
) -> None:
    """Test clustering with custom parameters."""
    # When
    result = cluster_mementos(
        sample_mementos,
        min_cluster_size=3,
        min_samples=1,
        allow_single_cluster=True,
    )

    # Then
    # Just verify the function runs without errors with custom parameters
    assert isinstance(result, dict)


def test_cluster_mementos_no_clusters_found(
    sample_mementos: list[MementoWithCoordinates],
) -> None:
    """Test behavior when no clusters are found (all points are noise)."""
    # Use very high min_cluster_size to force all points to be noise
    result = cluster_mementos(
        sample_mementos,
        min_cluster_size=len(sample_mementos) + 1,
    )

    # Then
    # Should return an empty dictionary since no clusters were formed
    memento_ids = [memento.id for memento in sample_mementos]
    assert result == {-1: memento_ids}


@patch("server.services.cluster_memento.hdbscan.logger")
def test_cluster_mementos_logging(
    mock_logger: MagicMock,
    sample_mementos: list[MementoWithCoordinates],
) -> None:
    """Test that logging happens as expected."""
    # When
    cluster_mementos(sample_mementos)

    # Then
    # Verify debug logs were called
    assert mock_logger.debug.call_count == 3

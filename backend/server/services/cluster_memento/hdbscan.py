from typing import List, Optional

import numpy as np
from hdbscan import HDBSCAN
from loguru import logger
from sklearn.preprocessing import StandardScaler

from server.api.memento.models import MementoWithCoordinates


def cluster_mementos(
    mementos: List[MementoWithCoordinates],
    min_cluster_size: int = 5,
    min_samples: Optional[int] = None,
    allow_single_cluster: bool = True,
    prediction_data: bool = True,
) -> dict[int, List[int]]:
    """Cluster Mementos based on geographical coordinates and return recommended IDs."""

    # Extract coordinates and IDs
    ids = [memento.id for memento in mementos]
    if len(mementos) < min_cluster_size:
        logger.warning("Less mementos than minimum cluster size!")
        return {-1: ids}

    coordinates = np.array(
        [[memento.coordinates.lat, memento.coordinates.long] for memento in mementos],
    )
    scaler = StandardScaler()
    scaled_coordinates = scaler.fit_transform(coordinates)
    logger.info(f"Scaled Coordinates: {scaled_coordinates}")

    clusterer = HDBSCAN(
        min_cluster_size=min_cluster_size,
        min_samples=min_samples,
        allow_single_cluster=allow_single_cluster,
        prediction_data=prediction_data,
    )
    cluster_labels = clusterer.fit_predict(scaled_coordinates)

    logger.info(f"Cluster Labels: {cluster_labels}")

    clusters: dict[int, List[int]] = {}
    for i, label in enumerate(cluster_labels):
        if label not in clusters and label != -1:
            clusters[label] = []
        clusters[label].append(ids[i])

    logger.info(f"Clusters: {clusters}")

    return clusters

from typing import List

import numpy as np
from loguru import logger
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

from server.api.memento.models import MementoWithCoordinates


def cluster_mementos(
    mementos: List[MementoWithCoordinates], n_recommendations: int = 5
) -> List[int]:
    """
    Cluster Mementos based on geographical coordinates and return recommended IDs.

    Args:
        mementos: List of Memento dictionaries, each containing 'id' and 'coordinates' fields
                  where coordinates has 'lat' and 'lng' keys
        n_recommendations: Number of Mementos to recommend

    Returns:
        List of Memento IDs recommended as a collection
    """
    # Extract coordinates and IDs
    coordinates = np.array(
        [[memento.coordinates.lat, memento.coordinates.long] for memento in mementos]
    )
    ids = [memento.id for memento in mementos]

    # If we have fewer mementos than requested recommendations
    if len(mementos) <= n_recommendations:
        return ids

    # Scale the coordinates
    scaler = StandardScaler()
    scaled_coordinates = scaler.fit_transform(coordinates)

    logger.info(f"Memento IDs Received: {ids}")
    logger.info(f"Coordinates Received: {coordinates}")
    logger.info(f"Scaled Coordinates: {scaled_coordinates}")

    # Find optimal number of clusters using silhouette score
    best_n_clusters = 2  # Default
    best_score = -1

    # Try different numbers of clusters from 2 to min(10, n_mementos-1)
    max_clusters = min(10, len(mementos) - 1)
    for n_clusters in range(2, max_clusters + 1):
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(scaled_coordinates)

        # Calculate silhouette score
        score = silhouette_score(scaled_coordinates, labels)
        if score > best_score:
            best_score = score
            best_n_clusters = n_clusters

    logger.info(f"Best N Clusters: {best_n_clusters}")

    # Perform K-means with optimal cluster number
    kmeans = KMeans(n_clusters=best_n_clusters, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(scaled_coordinates)

    logger.info(f"KMeans: {kmeans}")

    # Find the most dense cluster (with the most Mementos)
    unique_labels, counts = np.unique(cluster_labels, return_counts=True)
    densest_cluster = unique_labels[np.argmax(counts)]

    logger.info(f"Densest Cluster: {densest_cluster}")

    # Get indices of mementos in the densest cluster
    cluster_indices = np.where(cluster_labels == densest_cluster)[0]

    # If the densest cluster has more elements than needed, select those closest to center
    if len(cluster_indices) > n_recommendations:
        cluster_center = kmeans.cluster_centers_[densest_cluster]

        # Calculate distances to center for all points in cluster
        distances = np.sqrt(
            np.sum((scaled_coordinates[cluster_indices] - cluster_center) ** 2, axis=1)
        )

        # Get indices of closest points
        closest_indices = np.argsort(distances)[:n_recommendations]
        recommended_indices = cluster_indices[closest_indices]
    else:
        recommended_indices = cluster_indices

    # Convert indices to IDs
    recommended_ids = [ids[i] for i in recommended_indices]

    logger.info(f"Recommended Ids: {recommended_ids}")

    return recommended_ids

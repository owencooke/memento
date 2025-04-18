"""
@description Background task for recommending collection based on results of
    HDBSCAN clustering algorithm, sends recommendation via websocket.
@requirements FR-38, FR-39, FR-40
"""

from random import choice

from loguru import logger
from pydantic import UUID4

from server.api.websocket.manager import websocket_manager
from server.api.websocket.models import WebSocketMessage, WSMessageType
from server.services.cluster_memento.hdbscan import cluster_mementos
from server.services.db.models.schema_public_latest import RejectedRecommendationsInsert
from server.services.db.queries.clustering import (
    create_rejected_collection,
    get_mementos_for_clustering,
    is_collection_rejected,
)


async def recommend_collection(user_id: UUID4) -> None:
    """Background task for recommeding a new collection via clustering."""
    mementos = get_mementos_for_clustering(user_id)
    clustered_memento_ids = cluster_mementos(mementos, min_cluster_size=3)

    logger.info(f"Clustered memento ids: {clustered_memento_ids}")

    # Check DB for previously rejected collections
    valid_recommendations = [
        memento_ids
        for memento_ids in clustered_memento_ids.values()
        if not is_collection_rejected(user_id, memento_ids)
    ]
    logger.info(f"Valid recommendation: {valid_recommendations}")

    # No valid recommendations
    if not valid_recommendations:
        return

    # Choose a random valid recommendation
    selected_recommendation = choice(valid_recommendations)
    await websocket_manager.send_message(
        user_id,
        WebSocketMessage(
            type=WSMessageType.RECOMMENDATION,
            body=selected_recommendation,
        ),
    )

    # Store recommendation to prevent repeated suggestions
    rejected_collection = create_rejected_collection(
        user_id,
        RejectedRecommendationsInsert(
            user_id=user_id,
            memento_ids=selected_recommendation,
        ),
    )
    logger.info(f"Added already used recommendation: {rejected_collection}")

import asyncio

from pydantic import UUID4

from server.api.websocket.manager import websocket_manager
from server.api.websocket.models import WebSocketMessage, WSMessageType
from server.services.cluster_memento.kmeans import cluster_mementos
from server.services.db.queries.memento import get_mementos_for_clustering


async def recommend_collection(user_id: UUID4) -> None:
    """Background task for recommeding a new collection via clustering."""
    # TODO: replace with actual algorithm call
    await asyncio.sleep(5)
    mementos = get_mementos_for_clustering(user_id)
    clustered_memento_ids = cluster_mementos(mementos, n_recommendations=2)

    # TODO: check DB to see if recommendation was already given

    await websocket_manager.send_message(
        user_id,
        WebSocketMessage(type=WSMessageType.RECOMMENDATION, body=clustered_memento_ids),
    )

import asyncio

from pydantic import UUID4

from server.api.websocket.manager import websocket_manager
from server.api.websocket.models import MessageType, WebSocketMessage
from server.services.db.queries.memento import get_mementos


async def recommend_collection(user_id: UUID4):
    # TODO: replace with actual algorithm call
    await asyncio.sleep(5)
    clustered_memento_ids = [memento.id for memento in get_mementos(user_id)]

    # TODO: check DB to see if recommendation was already given

    websocket_manager.send_message(
        user_id,
        WebSocketMessage(type=MessageType.RECOMMENDATION, body=clustered_memento_ids),
    )

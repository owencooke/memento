import uuid

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from loguru import logger
from pydantic import UUID4

from server.api.path import get_user_id
from server.api.websocket.manager import websocket_manager

router = APIRouter()


@router.websocket("/")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: UUID4 = Depends(get_user_id),
) -> None:
    """WebSocket endpoint for handling real-time communication."""
    session_id = uuid.uuid4()
    await websocket_manager.connect(user_id, session_id, websocket)
    try:
        # Keep connection alive
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await websocket_manager.disconnect(user_id, session_id)
    except Exception as e:
        logger.error(f"Unexpected WS error: {e}")
        await websocket_manager.disconnect(user_id, session_id)

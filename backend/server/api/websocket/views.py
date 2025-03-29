import uuid

from fastapi import APIRouter, Depends, WebSocket
from pydantic import UUID4

from server.api.path import get_user_id
from server.api.websocket.manager import websocket_manager

router = APIRouter()


@router.websocket("/")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: UUID4 = Depends(get_user_id),
):
    session_id = uuid.uuid4()
    await websocket_manager.connect(user_id, session_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        await websocket_manager.disconnect(user_id, session_id)

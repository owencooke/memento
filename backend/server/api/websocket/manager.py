from fastapi import WebSocket
from loguru import logger
from pydantic import UUID4

from server.api.websocket.models import (
    UserConnections,
    WebSocketMessage,
    WebSocketState,
)


class WebSocketManager:
    def __init__(self):
        self.state = WebSocketState(connections={})

    async def connect(self, user_id: UUID4, session_id: UUID4, websocket: WebSocket):
        """Adds a WebSocket connection for a user and specific session."""
        logger.info(
            f"Accepting WS connection for user[{user_id}] session[{session_id}]",
        )
        await websocket.accept()
        if user_id not in self.state.connections:
            self.state.connections[user_id] = UserConnections(sessions={})
        self.state.connections[user_id].sessions[session_id] = websocket

    async def disconnect(self, user_id: UUID4, session_id: UUID4):
        """Removes a WebSocket connection for a specific session."""
        logger.info(f"Disconnecting WS for user[{user_id}] session[{session_id}]")
        if user_id in self.state.connections:
            self.state.connections[user_id].sessions.pop(session_id, None)

            # Remove user_id if no more sessions remain
            if not self.state.connections[user_id].sessions:
                self.state.connections.pop(user_id, None)

    async def send_message(self, user_id: UUID4, message: WebSocketMessage):
        """Sends a message to all sessions for a specific user."""
        logger.info(f"Sending message to client via WS: {message}")
        if user_id in self.state.connections:
            for ws in self.state.connections[user_id].sessions.values():
                await ws.send_json(message.model_dump(mode="json"))


websocket_manager = WebSocketManager()

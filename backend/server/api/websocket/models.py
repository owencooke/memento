from enum import Enum
from typing import Any

from fastapi import WebSocket
from pydantic import UUID4, BaseModel, ConfigDict


class UserConnections(BaseModel):
    sessions: dict[UUID4, WebSocket]  # session_id -> WebSocket
    model_config = ConfigDict(arbitrary_types_allowed=True)


class WebSocketState(BaseModel):
    connections: dict[UUID4, UserConnections]  # user_id -> UserConnections


class MessageType(str, Enum):
    RECOMMENDATION = "recommendation"


class WebSocketMessage(BaseModel):
    type: MessageType
    body: Any

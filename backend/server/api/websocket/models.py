from enum import Enum
from typing import Any

from fastapi import WebSocket
from pydantic import UUID4, BaseModel, ConfigDict


class UserConnections(BaseModel):
    """Active WebSocket sessions for a specific user."""

    sessions: dict[UUID4, WebSocket]

    model_config = ConfigDict(arbitrary_types_allowed=True)


class WebSocketState(BaseModel):
    """Active WebSocket connections for all users."""

    connections: dict[UUID4, UserConnections]


class WSMessageType(str, Enum):
    """
    Enum for different types of WebSocket messages:
        RECOMMENDATION: for sending collection recommendations to client.
    """

    RECOMMENDATION = "recommendation"


class WebSocketMessage(BaseModel):
    """The structure of a WebSocket message."""

    type: WSMessageType
    body: Any

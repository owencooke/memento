from typing import Any

from server.api.websocket.models import WebSocketMessage, WSMessageType

OpenAPISchema = dict[str, Any]


def add_openapi_models(openapi_schema: OpenAPISchema) -> OpenAPISchema:
    """Modifies a generated OpenAPI schema to include additional Pydantic models."""

    # Manually add WSMessageType
    openapi_schema["components"]["schemas"]["WSMessageType"] = {
        "type": "string",
        "enum": [message.value for message in WSMessageType],
    }
    if "$defs" not in openapi_schema:
        openapi_schema["$defs"] = {}
    openapi_schema["$defs"]["WSMessageType"] = {
        "$ref": "#/components/schemas/WSMessageType",
    }

    # Manually add WebSocketMessage
    openapi_schema["components"]["schemas"][
        "WebSocketMessage"
    ] = WebSocketMessage.model_json_schema()

    return openapi_schema

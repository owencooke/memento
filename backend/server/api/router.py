from fastapi.routing import APIRouter

from server.api import collection, image, memento, monitoring, testing, user, websocket

# Nested routers that require user id access
user_id_router = APIRouter(prefix="/user/{user_id}")
user_id_router.include_router(memento.router, prefix="/memento", tags=["memento"])
user_id_router.include_router(
    collection.router,
    prefix="/collection",
    tags=["collection"],
)
user_id_router.include_router(
    websocket.router,
    prefix="/ws",
    tags=["ws"],
)


# Main API router
api_router = APIRouter()
api_router.include_router(monitoring.router)
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(image.router, prefix="/image", tags=["image"])
api_router.include_router(user_id_router)


# Testing router
api_router.include_router(testing.router)

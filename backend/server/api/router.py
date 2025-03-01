from fastapi.routing import APIRouter

from server.api import memento, monitoring, user

# Nested routers that require user id access
user_id_router = APIRouter(prefix="/user/{user_id}")
user_id_router.include_router(memento.router, prefix="/memento", tags=["memento"])

# Main API router
api_router = APIRouter()
api_router.include_router(monitoring.router)
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(user_id_router)

from fastapi.routing import APIRouter

from server.api import monitoring, user, memento

api_router = APIRouter()
api_router.include_router(monitoring.router)
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(memento.router, prefix="/memento", tags=["memento"])

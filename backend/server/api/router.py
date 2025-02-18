from fastapi.routing import APIRouter

from server.api import user, monitoring

api_router = APIRouter()
api_router.include_router(monitoring.router)
api_router.include_router(user.router, prefix="/echo", tags=["echo"])

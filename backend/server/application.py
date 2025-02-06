from fastapi import FastAPI

from server.api.router import api_router
from server.config.log import configure_logging


def get_app() -> FastAPI:
    """
    Get FastAPI application.

    This is the main constructor of an application.

    :return: application.
    """
    configure_logging()
    app = FastAPI()

    # Main router for the API.
    app.include_router(router=api_router, prefix="/api")

    return app

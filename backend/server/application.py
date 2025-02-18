from fastapi import FastAPI

from server.api.router import api_router
from server.config.log import configure_logging
from fastapi.middleware.cors import CORSMiddleware


def get_app() -> FastAPI:
    """
    Get FastAPI application.

    This is the main constructor of an application.

    :return: application.
    """
    configure_logging()
    app = FastAPI(
        title="Memento Backend",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Accept requests from any origin
        allow_credentials=True,
        allow_methods=["*"],  # Allow all HTTP methods
        allow_headers=["*"],  # Allow all headers
    )

    # Main router for the API.
    app.include_router(router=api_router, prefix="/api")

    return app

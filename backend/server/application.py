from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.api.router import api_router
from server.config.log import configure_logging
from server.config.openapi import add_openapi_models


def get_app() -> FastAPI:
    """Initializes the FastAPI application."""
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

    # Main API router (includes all nested routes)
    app.include_router(router=api_router, prefix="/api")

    # Override app's openapi generation method to include additional models
    openapi_schema = app.openapi()
    app.openapi = lambda: add_openapi_models(openapi_schema)  # type: ignore

    return app

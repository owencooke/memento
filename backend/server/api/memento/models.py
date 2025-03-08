from pydantic import BaseModel

from server.services.db.models.gis import BaseWithCoordinates, CoordinatesInsert
from server.services.db.models.schema_public_latest import (
    ImageInsert,
    MementoInsert,
    MementoUpdate,
)

# Note: the ignores are for MyPy, to ignore "coordinates" field type differences


class NewMemento(CoordinatesInsert, BaseWithCoordinates, MementoInsert):  # type: ignore[misc]
    """Inserting a new Memento record to the DB.

    Overrides coordinates with proper Pydantic model.
    """


class NewImageMetadata(CoordinatesInsert, BaseWithCoordinates, ImageInsert):  # type: ignore[misc]
    """Inserting a new Image record to the DB.

    Overrides coordinates with proper Pydantic model.
    """


class UpdateMemento(CoordinatesInsert, BaseWithCoordinates, MementoUpdate):  # type: ignore[misc]
    """Inserting a new Memento record to the DB.

    Overrides coordinates with proper Pydantic model.
    """


class CreateMementoSuccessResponse(BaseModel):
    """Successful response model for the Create Memento route."""

    new_memento_id: int
    message: str = "Successfully created new Memento"

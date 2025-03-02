from server.services.db.models.gis import BaseWithCoordinates
from server.services.db.models.schema_public_latest import (
    ImageInsert,
    MementoInsert,
)

# Note: the ignores are for MyPy, to ignore "coordinates" field type differences


class NewMemento(BaseWithCoordinates, MementoInsert):  # type: ignore[misc]
    """Inserting a new Memento record to the DB.

    Overrides coordinates with proper Pydantic model.
    """


class NewImageMetadata(BaseWithCoordinates, ImageInsert):  # type: ignore[misc]
    """Inserting a new Image record to the DB.

    Overrides coordinates with proper Pydantic model.
    """

from server.services.db.models.gis import BaseWithCoordinates
from server.services.db.models.schema_public_latest import CollectionInsert

# Note: the ignores are for MyPy, to ignore "coordinates" field type differences


class NewCollection(BaseWithCoordinates, CollectionInsert):  # type: ignore[misc]
    """Inserting a new Collection to the DB.

    Overrides coordinates with proper Pydantic model.
    """

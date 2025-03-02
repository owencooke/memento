from server.services.db.models.gis import BaseWithCoordinates
from server.services.db.models.schema_public_latest import (
    ImageInsert,
    MementoInsert,
)


class NewMemento(BaseWithCoordinates, MementoInsert):
    model_config = {"exclude": {"user_id"}}


class NewImageMetadata(BaseWithCoordinates, ImageInsert):
    pass

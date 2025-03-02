from server.services.db.models.base import SupabaseModel
from server.services.db.models.gis import BaseWithCoordinates
from server.services.db.models.schema_public_latest import (
    ImageInsert,
    MementoInsert,
)


class NewMemento(SupabaseModel, BaseWithCoordinates, MementoInsert):
    model_config = {"exclude": {"user_id"}}


class NewImageMetadata(SupabaseModel, BaseWithCoordinates, ImageInsert):
    pass

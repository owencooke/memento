from pydantic import Field

from server.services.db.models.schema_public_latest import (
    CollectionBaseSchema,
    HasMementoBaseSchema,
)


class CollectionWithMementos(CollectionBaseSchema):
    mementos: list[HasMementoBaseSchema]

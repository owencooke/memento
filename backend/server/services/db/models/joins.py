from pydantic import Field

from server.services.db.models.gis import CoordinatesConverter
from server.services.db.models.schema_public_latest import (
    CollectionBaseSchema,
    HasMementoBaseSchema,
    ImageBaseSchema,
    MementoBaseSchema,
)


class CollectionWithMementos(CollectionBaseSchema):
    mementos: list[HasMementoBaseSchema]


class ImageWithUrl(CoordinatesConverter, ImageBaseSchema):
    url: str = Field(default="")


class MementoWithImages(MementoBaseSchema):
    images: list[ImageWithUrl]

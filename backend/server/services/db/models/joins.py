from pydantic import Field

from server.services.db.models.gis import BaseWithCoordinates
from server.services.db.models.schema_public_latest import (
    CollectionBaseSchema,
    HasMementoBaseSchema,
    ImageBaseSchema,
    MementoBaseSchema,
)


class ImageWithUrl(BaseWithCoordinates, ImageBaseSchema):
    url: str = Field(default="")


class MementoWithImages(BaseWithCoordinates, MementoBaseSchema):
    images: list[ImageWithUrl]


class CollectionWithMementos(BaseWithCoordinates, CollectionBaseSchema):
    mementos: list[HasMementoBaseSchema]

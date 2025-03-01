from typing import Optional
from pydantic import Field
from server.services.db.models.gis import GeoLocationModel, Location
from server.services.db.models.schema_public_latest import (
    MementoBaseSchema,
    ImageBaseSchema,
)


class ImageWithUrl(ImageBaseSchema, GeoLocationModel):
    url: str = Field(default="")


class MementoWithImages(MementoBaseSchema, GeoLocationModel):
    images: list[ImageWithUrl]

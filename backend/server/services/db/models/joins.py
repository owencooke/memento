from typing import Optional

from pydantic import Field, field_validator, model_validator

from server.services.db.models.gis import BaseWithCoordinates
from server.services.db.models.schema_public_latest import (
    CollectionBaseSchema,
    HasMementoBaseSchema,
    ImageBaseSchema,
    MementoBaseSchema,
)


class ImageWithUrl(BaseWithCoordinates, ImageBaseSchema):
    url: str = Field(default="")

    @field_validator("image_label", mode="before")
    @classmethod
    def format_label(cls, v: Optional[str]) -> Optional[str]:
        """Formats image label for display on frontend"""
        if v is None:
            return None
        return " ".join(word.capitalize() for word in v.split("_"))


class MementoWithImages(BaseWithCoordinates, MementoBaseSchema):
    images: list[ImageWithUrl]


class CollectionWithMementos(BaseWithCoordinates, CollectionBaseSchema):
    mementos: list[HasMementoBaseSchema]

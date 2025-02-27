from server.services.db.models.schema_public_latest import (
    MementoBaseSchema,
    ImageBaseSchema,
)


class MementoWithImages(MementoBaseSchema):
    images: list[ImageBaseSchema]

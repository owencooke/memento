import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator

from server.services.db.models.gis import BaseWithCoordinates, CoordinatesInsert
from server.services.db.models.schema_public_latest import (
    ImageInsert,
    MementoInsert,
    MementoUpdate,
)

# Note: the ignores are for MyPy, to ignore "coordinates" field type differences


class NewMemento(CoordinatesInsert, BaseWithCoordinates, MementoInsert):  # type: ignore[misc]
    """Inserting a new Memento record to the DB.

    Overrides coordinates with proper Pydantic model.
    """


class NewImageMetadata(CoordinatesInsert, BaseWithCoordinates, ImageInsert):  # type: ignore[misc]
    """Inserting a new Image record to the DB.

    Overrides coordinates with proper Pydantic model.
    """


class UpdateMemento(CoordinatesInsert, BaseWithCoordinates, MementoUpdate):  # type: ignore[misc]
    """Inserting a new Memento record to the DB.

    Overrides coordinates with proper Pydantic model.
    """


class MementoFilterParams(BaseModel):
    """Filter parameters for Memento"""

    start_date: datetime.date | None = Field(default=None)
    end_date: datetime.date | None = Field(default=None)

    @field_validator("end_date")
    @classmethod
    def check_date_order(
        cls,
        end_date: datetime.date,
        values: dict[str, Any],
    ) -> datetime.date:
        """Checks that end date is gte start_date"""
        if end_date and values.get("start_date") and end_date < values["start_date"]:
            raise ValueError("end date must be greater than or equal to start date")
        return end_date

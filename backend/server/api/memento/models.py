import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

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

    start_date: Optional[datetime.date] = Field(default=None)
    end_date: Optional[datetime.date] = Field(default=None)
    min_lat: Optional[float] = Field(default=None)
    min_long: Optional[float] = Field(default=None)
    max_lat: Optional[float] = Field(default=None)
    max_long: Optional[float] = Field(default=None)
    text: Optional[str] = Field(
        default=None, description="Text to search in memento caption and detected text"
    )

    @model_validator(mode="before")
    @classmethod
    def check_date_order(cls, data: Any) -> Any:
        """Checks that end date is gte start_date"""
        if (
            isinstance(data, dict)
            and data["end_date"]
            and data["start_date"]
            and data["end_date"] < data["start_date"]
        ):
            raise ValueError("end date must be greater than or equal to start date")

        return data

    @model_validator(mode="before")
    @classmethod
    def all_bounds_values(cls, data: Any) -> Any:
        """Ensure all bounding box values are provided if any are set"""
        bbox_fields = ["min_lat", "min_long", "max_lat", "max_long"]
        bbox_values = [data.get(field) for field in bbox_fields]
        if any(bbox_values) and not all(bbox_values):
            raise ValueError(
                "All bounding box coordinates (min_lat, min_long, max_lat, max_long) must be provided"
            )

        return data

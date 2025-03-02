from typing import Any, Dict, Optional
from typing_extensions import Self
from pydantic import BaseModel, Field, field_validator


class Coordinates(BaseModel):
    """A model that provides methods for converting lat/long
    coordinates between a variety of formats.
    """

    lat: float
    long: float

    def to_gis_string(self) -> str:
        """Convert to PostGIS point format string used for Supabase insert queries"""
        return f"POINT({self.long} {self.lat})"

    @classmethod
    def from_geojson(cls, geojson: Dict) -> Self:
        """Create a model from a GeoJSON dictionary.
        Reference: https://geojson.org/
        """
        if geojson.get("type") == "Point" and "coordinates" in geojson:
            long, lat = geojson["coordinates"]
            return cls(lat=lat, long=long)
        raise ValueError(f"Invalid GeoJSON format: {geojson}")


class BaseWithCoordinates(BaseModel):
    """A convenience model that can be inherited from to ensure coordinates are included as a Coordinates model."""

    coordinates: Coordinates | None = Field(default=None)

    @field_validator("coordinates", mode="before")
    @classmethod
    def convert_to_coordinates(cls, v: Any) -> Optional[Coordinates]:
        """Converts a value to a Coordinates model, if possible"""
        if v is None:
            return None
        if isinstance(v, Coordinates):
            return v
        if isinstance(v, dict):
            # Dict in custom Coordinates format
            if "lat" in v and "long" in v:
                return Coordinates.model_validate(v)
            # Dict in GeoJSON format
            try:
                return Coordinates.from_geojson(v)
            except (ValueError, TypeError, AttributeError):
                pass
        return None


class CoordinatesInsert(BaseModel):
    """Base model for Supabase inserts that handles GIS coordinates automatically."""

    def model_dump(self, **kwargs) -> Dict[str, Any]:
        """Override standard model_dump to include GIS insert form."""
        data = super().model_dump(**kwargs)
        if (
            "coordinates" in data
            and hasattr(self, "coordinates")
            and isinstance(self.coordinates, Coordinates)
        ):
            data["coordinates"] = self.coordinates.to_gis_string()
        return data

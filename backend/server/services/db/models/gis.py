from typing import Any, Dict, Optional
from typing_extensions import Self
from pydantic import BaseModel, Field, field_validator


class Location(BaseModel):
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


class CoordinatesConverter(BaseModel):
    """A convenience model that can be inherited from to ensure coordinates are converted into a Location model."""

    coordinates: Location | None = Field(default=None)

    @field_validator("coordinates", mode="before")
    @classmethod
    def convert_geojson_to_location(cls, v: Any) -> Optional[Location]:
        """Convert coordinates to Location object if possible"""
        if v is None:
            return None
        if isinstance(v, Location):
            return v
        try:
            return Location.from_geojson(v)
        except (ValueError, TypeError, AttributeError):
            return None

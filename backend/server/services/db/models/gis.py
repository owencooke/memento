from typing import Any, Dict, Optional
from typing_extensions import Self
from pydantic import BaseModel, Field, field_validator


class Location(BaseModel):
    lat: float
    long: float

    def to_gis_string(self) -> str:
        """Convert to PostGIS point format string used for Supabase insert queries"""
        return f"POINT({self.long} {self.lat})"

    @classmethod
    def from_gis_object(cls, gis_object: Dict) -> Self:
        """Create from object returned by Supabase queries
        Format: {'type': 'Point', 'coordinates': [long, lat]}
        """
        if isinstance(gis_object, dict):
            if (
                "type" in gis_object
                and gis_object["type"] == "Point"
                and "coordinates" in gis_object
            ):
                long, lat = gis_object["coordinates"]
                return cls(lat=lat, long=long)
        raise ValueError(f"Invalid GIS object format: {gis_object}")


class GeoLocationModel(BaseModel):
    coordinates: Location | None = Field(default=None)

    @field_validator("coordinates", mode="before")
    @classmethod
    def validate_coordinates(cls, v: Any) -> Optional[Location]:
        """Convert coordinates to Location object if possible"""
        if v is None:
            return None

        if isinstance(v, Location):
            return v

        try:
            return Location.from_gis_object(v)
        except (ValueError, TypeError, AttributeError):
            # If conversion fails, return None
            return None

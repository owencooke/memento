from pydantic import BaseModel


class Location(BaseModel):
    lat: float
    long: float

    def to_gis_string(self) -> str:
        """Convert to PostGIS point format string used for Supabase insert queries"""
        return f"POINT({self.long} {self.lat})"

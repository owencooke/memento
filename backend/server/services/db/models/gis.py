from typing_extensions import Self
from pydantic import BaseModel


class Location(BaseModel):
    lat: float
    long: float

    def to_supabase_string(self) -> str:
        return f"POINT({self.long} {self.lat})"

    # @classmethod
    # def from_gis_string(self, gis_string: str) -> Self:

    #     return self(**db_result)

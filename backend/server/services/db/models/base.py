from datetime import date
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class SupabaseModel(BaseModel):
    """Base model with custom serialization for Supabase compatibility."""

    model_config = ConfigDict(
        json_encoders={date: lambda d: d.isoformat(), UUID: lambda u: str(u)},
    )

from datetime import date
from typing import Any, Dict
from uuid import UUID


def convert_to_supabase_types(model: Any) -> Dict[str, Any]:
    """Helper function to convert a Pydantic model to Supabase expected types."""
    data = model.model_dump()
    for key, value in data.items():
        # Ensure ISO dates
        if isinstance(value, date):
            data[key] = value.isoformat()
        # Ensure UUID serialized as string
        elif isinstance(value, UUID):
            data[key] = str(value)
    return data

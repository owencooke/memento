from server.services.db.config import supabase
from server.services.db.models.schema_public_latest import Memento, MementoInsert
from server.services.db.utils import convert_to_supabase_types


def create_memento(new_memento: MementoInsert) -> Memento:
    """Creates a new memento for a user."""
    response = (
        supabase.table("memento")
        .insert(convert_to_supabase_types(new_memento))
        .execute()
    )
    return Memento(**response.data[0])

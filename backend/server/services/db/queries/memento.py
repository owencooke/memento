"""
@description Supabase DB queries for Keepsakes/Mementos.
@requirements FR-17, FR-19, FR-26, FR-27
"""

from pydantic import UUID4

from server.api.memento.models import NewMemento, UpdateMemento
from server.services.db.config import supabase
from server.services.db.models.joins import MementoWithImages
from server.services.db.models.schema_public_latest import Memento


def create_memento(new_memento: NewMemento, user_id: UUID4) -> Memento:
    """Creates a new memento for a user."""
    response = (
        supabase.table("memento")
        .insert({**new_memento.model_dump(mode="json"), "user_id": str(user_id)})
        .execute()
    )
    return Memento(**response.data[0])


def get_mementos(user_id: UUID4) -> list[MementoWithImages]:
    """Gets all the mementos belonging to a user."""
    response = (
        supabase.table("memento")
        .select("*, images:image(*)")
        .eq("user_id", str(user_id))
        .execute()
    )
    return [MementoWithImages(**item) for item in response.data]


def update_memento(id: int, updated_memento: UpdateMemento) -> Memento:
    """Updates an existing memento record."""
    response = (
        supabase.table("memento")
        .update({**updated_memento.model_dump(mode="json")})
        .eq("id", id)
        .execute()
    )
    return Memento(**response.data[0])

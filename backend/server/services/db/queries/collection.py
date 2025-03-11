"""
@description Queries for Collection DB operations.

@requirements FR-3, FR-35, FR-36, FR-37
"""

from pydantic import UUID4

from server.api.collection.models import NewCollection, UpdateCollection
from server.services.db.config import supabase
from server.services.db.models.joins import CollectionWithMementos
from server.services.db.models.schema_public_latest import (
    Collection,
    HasMemento,
    HasMementoInsert,
    HasMementoUpdate,
)


def get_collections(
    user_id: UUID4,
) -> list[CollectionWithMementos]:
    """Gets collections and associated mementos for a user."""
    response = (
        supabase.table("collection")
        .select("*, mementos:has_memento(*)")
        .eq("user_id", str(user_id))
        .execute()
    )
    return [CollectionWithMementos(**collection) for collection in response.data]


def create_collection(new_collection: NewCollection, user_id: UUID4) -> Collection:
    """Creates a new collection for a user."""
    response = (
        supabase.table("collection")
        .insert({**new_collection.model_dump(mode="json"), "user_id": str(user_id)})
        .execute()
    )
    return Collection(**response.data[0])


def update_collection(id: int, updated_collection: UpdateCollection) -> Collection:
    """Updates an existing collection record."""
    response = (
        supabase.table("collection")
        .update({**updated_collection.model_dump(mode="json", exclude={"user_id"})})
        .eq("id", id)
        .execute()
    )
    return Collection(**response.data[0])


def db_delete_collection(id: int) -> Collection:
    """Deletes a collection from the DB."""
    response = supabase.table("collection").delete().eq("id", id).execute()
    return Collection(**response.data[0])


def associate_memento(has_memento: HasMementoInsert) -> HasMemento:
    """Associated a memento with a collection."""
    response = (
        supabase.table("has_memento")
        .insert({**has_memento.model_dump(mode="json")})
        .execute()
    )

    if not response.data:
        raise ValueError("Failed to associate memento with collection")

    return HasMemento(**response.data[0])


def update_associate_memento(updated_has_memento: HasMementoUpdate) -> HasMemento:
    """Updates a memento collection association"""
    response = (
        supabase.table("has_memento")
        .update({**updated_has_memento.model_dump(mode="json")})
        .eq("id", id)
        .execute()
    )
    return HasMemento(**response.data[0])

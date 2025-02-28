from pydantic import UUID4

from server.services.db.config import supabase
from server.services.db.models.joins import CollectionWithMementos
from server.services.db.models.schema_public_latest import (
    Collection,
    CollectionInsert,
    HasMemento,
    HasMementoInsert,
)
from server.services.db.utils import convert_to_supabase_types


def get_collections(
    user_id: UUID4,
) -> list[CollectionWithMementos]:
    """Gets collections and associated mementos for a user."""
    response = (
        supabase.table("collection")
        .select("*, has_memento(*)")
        .eq("user_id", str(user_id))
        .execute()
    )
    collections = response.data or []

    formatted_collections = []
    for collection in collections:
        mementos = list(collection.get("has_memento", []))
        formatted_collections.append(
            CollectionWithMementos(**collection, mementos=mementos),
        )
    return formatted_collections


def create_collection(new_collection: CollectionInsert) -> Collection:
    """Creates a new collection for a user."""
    response = (
        supabase.table("collection")
        .insert(convert_to_supabase_types(new_collection))
        .execute()
    )
    return Collection(**response.data[0])


def associate_memento(has_memento: HasMementoInsert) -> HasMemento:
    """Associated a memento with a collection."""
    response = (
        supabase.table("has_memento")
        .insert(convert_to_supabase_types(has_memento))
        .execute()
    )

    if not response.data:
        raise ValueError("Failed to associate memento with collection")

    return HasMemento(**response.data[0])  # Return actual HasMemento objec

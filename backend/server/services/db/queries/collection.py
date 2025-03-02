from pydantic import UUID4

from server.api.collection.models import NewCollection
from server.services.db.config import supabase
from server.services.db.models.joins import CollectionWithMementos
from server.services.db.models.schema_public_latest import (
    Collection,
    HasMemento,
    HasMementoInsert,
)


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


def create_collection(new_collection: NewCollection, user_id: UUID4) -> Collection:
    """Creates a new collection for a user."""
    response = (
        supabase.table("collection")
        .insert({**new_collection.model_dump(mode="json"), "user_id": str(user_id)})
        .execute()
    )
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

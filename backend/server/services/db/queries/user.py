from fastapi import HTTPException
from pydantic import UUID4

from server.services.db.config import supabase
from server.services.db.models.schema_public_latest import (
    Collections,
    CollectionsInsert,
    UserInfo,
)


def get_user_info(id: UUID4) -> UserInfo:
    """Gets user info from DB table for specific user id."""
    response = supabase.table("user_info").select("*").eq("id", id).execute()
    return UserInfo(**response.data[0])


def fetch_collections(user_id: UUID4) -> list[Collections]:  # Updated function name
    """Gets collections from DB table for specific user_id."""
    response = (
        supabase.table("collections").select("*").eq("user_id", str(user_id)).execute()
    )

    collections = response.data
    return (
        [Collections(**collection) for collection in collections] if collections else []
    )


def insert_collection(collection: CollectionsInsert) -> CollectionsInsert:
    """Inserts a collection in the database."""
    response = (
        supabase.table("collections")
        .insert(
            {
                "user_id": str(collection.user_id),
                "title": collection.title,
                "caption": collection.caption,
            }
        )
        .execute()
    )

    return CollectionsInsert(**response.data[0])

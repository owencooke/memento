"""
@description Supabase DB queries for Keepsakes/Mementos.
@requirements FR-17, FR-19, FR-26, FR-27, FR30, FR33
"""

from pydantic import UUID4

from server.api.memento.models import MementoFilterParams, NewMemento, UpdateMemento
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


def get_mementos(
    user_id: UUID4,
    filter_query: MementoFilterParams | None,
) -> list[MementoWithImages]:
    """Gets all the mementos belonging to a user."""
    query = (
        supabase.table("memento")
        .select("*, images:image(*)")
        .eq("user_id", str(user_id))
    )

    if filter_query:
        if filter_query.start_date:
            query.gte("date", filter_query.start_date.isoformat())
        if filter_query.end_date:
            query.lte("date", filter_query.end_date.isoformat())
        if filter_query.text:
            query.text_search("memento_searchable_content", filter_query.text)

        # Bounding box filtering using the RPC function
        if all(
            [
                filter_query.min_lat,
                filter_query.min_long,
                filter_query.max_lat,
                filter_query.max_long,
            ],
        ):
            bbox_response = supabase.rpc(
                "mementos_in_bounds",
                {
                    "min_lat": filter_query.min_lat,
                    "min_long": filter_query.min_long,
                    "max_lat": filter_query.max_lat,
                    "max_long": filter_query.max_long,
                },
            ).execute()

            bbox_memento_ids = [item["id"] for item in bbox_response.data]
            if bbox_memento_ids:
                # rest of query mementos must be in bounding box mementos
                query.in_("id", bbox_memento_ids)
            else:
                # If no mementos are in the bounding box, return an empty list early
                return []

    response = query.execute()
    return [MementoWithImages(**item) for item in response.data]


def update_memento(id: int, updated_memento: UpdateMemento) -> Memento:
    """Updates an existing memento record."""
    response = (
        supabase.table("memento")
        .update({**updated_memento.model_dump(mode="json", exclude={"user_id"})})
        .eq("id", id)
        .execute()
    )
    return Memento(**response.data[0])

from pydantic import UUID4

from server.api.memento.models import (
    MementoWithCoordinates,
)
from server.services import db
from server.services.db.models.schema_public_latest import (
    RejectedRecommendations,
    RejectedRecommendationsInsert,
)


def get_mementos_for_clustering(user_id: UUID4) -> list[MementoWithCoordinates]:
    """Retrieves mementos with a non-null coordinates field"""
    query = (
        db.supabase.table("memento")
        .select("user_id, id, coordinates")
        .eq("user_id", str(user_id))
        .neq("coordinates", None)
    )
    response = query.execute()
    return [MementoWithCoordinates(**item) for item in response.data]


def create_rejected_collection(
    user_id: UUID4,
    recommendation: RejectedRecommendationsInsert,
) -> RejectedRecommendations:
    """Adds a rejected collection to the db"""
    response = (
        db.supabase.table("rejected_recommendations")
        .insert({**recommendation.model_dump(mode="json"), "user_id": str(user_id)})
        .execute()
    )
    return RejectedRecommendations(**response.data[0])


def is_collection_rejected(user_id: UUID4, memento_ids: list[int]) -> bool:
    """Checks if a set of memento_ids have been rejected before"""
    # cs expects PostgreSQL array format
    pg_array = "{" + ",".join(map(str, memento_ids)) + "}"

    response = (
        db.supabase.table("rejected_recommendations")
        .select("id")
        .filter("user_id", "eq", str(user_id))
        .filter("memento_ids", "cs", pg_array)
        .execute()
    )
    return len(response.data) > 0

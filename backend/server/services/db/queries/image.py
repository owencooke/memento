"""
@description Supabase DB queries for Image Metadata.
@requirements FR-21, FR-32
"""

from server.api.memento.models import NewImageMetadata
from server.services.db.config import supabase
from server.services.db.models.joins import ImageWithUrl


def create_image_metadata(metadata: NewImageMetadata, memento_id: int) -> bool:
    """Creates a new image metadata record for an image asssociated with a memento."""
    response = (
        supabase.table("image")
        .insert({**metadata.model_dump(mode="json"), "memento_id": memento_id})
        .execute()
    )
    return len(response.data) == 1


def get_images_for_memento(memento_id: int) -> list[ImageWithUrl]:
    """Gets all the images belonging to a memento."""
    response = (
        supabase.table("image").select("*").eq("memento_id", memento_id).execute()
    )
    return [ImageWithUrl(**item) for item in response.data]


def delete_image_metadata(id: int) -> bool:
    """Deletes an image metadata record for specific id."""
    response = supabase.table("image").delete().eq("id", id).execute()
    return len(response.data) == 1


def update_image_order(id: int, order_index: int) -> bool:
    """Updates an image metadata record with new re-ordered index."""
    response = (
        supabase.table("image")
        .update({"order_index": order_index})
        .eq("id", id)
        .execute()
    )
    return len(response.data) == 1

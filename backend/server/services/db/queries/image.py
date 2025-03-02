from server.api.memento.models import NewImageMetadata
from server.services.db.config import supabase


def create_image_metadata(metadata: NewImageMetadata, memento_id: int) -> bool:
    """Creates a new image metadata record for an image asssociated with a memento."""
    response = (
        supabase.table("image")
        .insert({**metadata.model_dump(), "memento_id": memento_id})
        .execute()
    )
    return len(response.data) == 1

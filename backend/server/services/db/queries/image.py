from server.services.db.config import supabase
from server.services.db.models.schema_public_latest import ImageInsert
from server.services.db.utils import convert_to_supabase_types


def create_image_metadata(metadata: ImageInsert, memento_id: int) -> bool:
    """Creates a new image metadata record for an image asssociated with a memento."""
    response = (
        supabase.table("image")
        .insert({**convert_to_supabase_types(metadata), "memento_id": memento_id})
        .execute()
    )
    return len(response.data) == 1

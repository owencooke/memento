from server.services.db.config import supabase
from server.services.db.models.schema_public_latest import Image, ImageInsert
from server.services.db.utils import convert_to_supabase_types


async def create_image_metadata(metadata: ImageInsert) -> Image:
    """Creates a new image metadata record for an image asssociated with a memento."""
    response = (
        supabase.table("image").insert(convert_to_supabase_types(metadata)).execute()
    )
    return Image(**response.data[0])

from typing import cast

from supabase import Client, create_client

from server.config.settings import settings

url: str = settings.supabase_url
key: str = settings.supabase_key

# No URL/key for CI; just set to None (casted to avoid MyPy error)
supabase = create_client(url, key) if url and key else cast(Client, None)

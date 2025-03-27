from supabase import Client, create_client

from server.config.settings import settings

url: str = settings.supabase_url
key: str = settings.supabase_key
supabase: Client = create_client(url, key)

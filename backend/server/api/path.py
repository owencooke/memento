from fastapi import Path
from pydantic import UUID4


def get_user_id(user_id: UUID4 = Path()):
    """Common dependency to extract user_id from a higher-level route path"""
    return user_id

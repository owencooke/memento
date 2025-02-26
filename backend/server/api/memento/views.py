from fastapi import APIRouter, HTTPException

from server.services.db.models.schema_public_latest import Memento, MementoInsert
from server.services.db.queries.memento import create_memento

router = APIRouter()


@router.post("/", response_model=Memento)
def create_memento_route(memento: MementoInsert) -> Memento:
    """Creates a new memento."""
    try:
        new_memento = create_memento(memento)
        return new_memento
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

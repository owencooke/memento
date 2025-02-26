from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/")
def health_check() -> JSONResponse:
    """
    Checks the health of a project.

    It returns 200 if the project is healthy.
    """
    return {"message": "Healthy!"}

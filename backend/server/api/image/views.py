from fastapi import APIRouter, HTTPException
from pydantic import UUID4, BaseModel
from fastapi.responses import JSONResponse

from PIL import Image
import pytesseract
import base64
from io import BytesIO

from server.services.db.models.schema_public_latest import (
    UserInfo,
)
from server.services.db.queries.user import (
    get_user_info,
)

router = APIRouter()

class ImageData(BaseModel):
    image_base64: str

@router.post("/extract_text")
async def extract_text(data: ImageData):
    """Uses OCR library to extract text from image"""
    try:
        # Decode base64 string
        image_data = base64.b64decode(data.image_base64)
        
        # Convert to PIL Image
        image = Image.open(BytesIO(image_data))
        
        # Perform OCR
        extracted_text = pytesseract.image_to_string(image)
        
        return {"extracted_text": extracted_text}
    
    except Exception as e:
        return {"error": str(e)}

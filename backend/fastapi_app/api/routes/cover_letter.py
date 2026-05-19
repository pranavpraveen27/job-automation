from fastapi import APIRouter

from fastapi_app.schemas.cover_letter import CoverLetterRequest, CoverLetterResponse
from fastapi_app.services.cover_letter_service import CoverLetterService

router = APIRouter()


@router.post("/generate", response_model=CoverLetterResponse)
async def generate_cover_letter(request: CoverLetterRequest) -> CoverLetterResponse:
    cover_letter = await CoverLetterService.generate_cover_letter(request)
    return CoverLetterResponse(cover_letter=cover_letter)

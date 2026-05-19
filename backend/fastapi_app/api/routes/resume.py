from fastapi import APIRouter, File, HTTPException, UploadFile

from fastapi_app.schemas.resume import ResumeExtractionResponse
from fastapi_app.services.resume_service import ResumeService

router = APIRouter()


@router.post("/upload", response_model=ResumeExtractionResponse)
async def upload_resume(file: UploadFile = File(...)) -> ResumeExtractionResponse:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Resume upload must be a PDF file.")

    contents = await file.read()
    try:
        text = await ResumeService.extract_text(contents)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    skills = await ResumeService.extract_skills(text)
    return ResumeExtractionResponse(text=text, skills=skills)


@router.post("/extract", response_model=ResumeExtractionResponse)
async def extract_resume_text(file: UploadFile = File(...)) -> ResumeExtractionResponse:
    contents = await file.read()
    try:
        text = await ResumeService.extract_text(contents)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    skills = await ResumeService.extract_skills(text)
    return ResumeExtractionResponse(text=text, skills=skills)

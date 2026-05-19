from fastapi import APIRouter, File, HTTPException, UploadFile

from fastapi_app.schemas.resume import (
    ResumeCritiqueResponse,
    ResumeExtractionResponse,
    ResumeInsightsResponse,
    ResumeScoreResponse,
    ResumeTextRequest,
)
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
    extracted_data = await ResumeService.extract_structured_data(text, skills)
    return ResumeExtractionResponse(text=text, skills=skills, extracted_data=extracted_data)


@router.post("/extract", response_model=ResumeExtractionResponse)
async def extract_resume_text(file: UploadFile = File(...)) -> ResumeExtractionResponse:
    contents = await file.read()
    try:
        text = await ResumeService.extract_text(contents)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    skills = await ResumeService.extract_skills(text)
    extracted_data = await ResumeService.extract_structured_data(text, skills)
    return ResumeExtractionResponse(text=text, skills=skills, extracted_data=extracted_data)


@router.post("/insights", response_model=ResumeInsightsResponse)
async def resume_insights(request: ResumeTextRequest) -> ResumeInsightsResponse:
    insights = await ResumeService.suggest_improvements(request.resume_text)
    return ResumeInsightsResponse(insights=insights)


@router.post("/critique", response_model=ResumeCritiqueResponse)
async def resume_critique(request: ResumeTextRequest) -> ResumeCritiqueResponse:
    critique = await ResumeService.critique_formatting(request.resume_text)
    return ResumeCritiqueResponse(critique=critique)


@router.post("/score", response_model=ResumeScoreResponse)
async def resume_score(request: ResumeTextRequest) -> ResumeScoreResponse:
    analysis = await ResumeService.analyze_quality(request.resume_text)
    return ResumeScoreResponse(analysis=analysis)

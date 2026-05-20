from fastapi import APIRouter

from fastapi_app.schemas.job import (
    ApplicationFieldsRequest,
    ApplicationFieldsResponse,
    JobAnalyzeRequest,
    JobAnalyzeResponse,
    JobMatchRequest,
    JobMatchResponse,
)
from fastapi_app.services.job_service import JobMatchService

router = APIRouter()


@router.post("/match", response_model=JobMatchResponse)
async def match_jobs(request: JobMatchRequest) -> JobMatchResponse:
    matches = await JobMatchService.match_jobs(request.candidate_skills, request.job_postings)
    return JobMatchResponse(matches=matches)


@router.post("/analyze", response_model=JobAnalyzeResponse)
async def analyze_resume_job_match(request: JobAnalyzeRequest) -> JobAnalyzeResponse:
    analysis = await JobMatchService.analyze_resume_job_match(request.resume_text, request.job_description)
    return JobAnalyzeResponse(analysis=analysis)


@router.post("/application-fields", response_model=ApplicationFieldsResponse)
async def generate_application_fields(request: ApplicationFieldsRequest) -> ApplicationFieldsResponse:
    fields = await JobMatchService.generate_application_fields(
        request.resume_text,
        request.job_description,
        request.cover_letter,
    )
    return ApplicationFieldsResponse(fields=fields)

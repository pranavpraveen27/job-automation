from fastapi import APIRouter

from fastapi_app.schemas.job import JobMatchRequest, JobMatchResponse
from fastapi_app.services.job_service import JobMatchService

router = APIRouter()


@router.post("/match", response_model=JobMatchResponse)
async def match_jobs(request: JobMatchRequest) -> JobMatchResponse:
    matches = await JobMatchService.match_jobs(request.candidate_skills, request.job_postings)
    return JobMatchResponse(matches=matches)

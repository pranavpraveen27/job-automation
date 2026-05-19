from typing import List

from pydantic import BaseModel


class JobPosting(BaseModel):
    id: str
    title: str
    company: str
    description: str


class JobMatchResult(BaseModel):
    job_id: str
    score: float
    title: str
    company: str
    matched_skills: List[str]


class JobMatchRequest(BaseModel):
    candidate_skills: List[str]
    job_postings: List[JobPosting]


class JobMatchResponse(BaseModel):
    matches: List[JobMatchResult]

from typing import List, Optional

from pydantic import BaseModel


class CoverLetterRequest(BaseModel):
    candidate_name: str
    candidate_summary: str
    skills: List[str]
    job_title: str
    company_name: str
    company_description: Optional[str] = ""


class CoverLetterResponse(BaseModel):
    cover_letter: str

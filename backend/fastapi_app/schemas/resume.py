from typing import Any, Dict, List

from pydantic import BaseModel


class ResumeExtractionResponse(BaseModel):
    text: str
    skills: List[str]
    extracted_data: Dict[str, Any] = {}


class ResumeTextRequest(BaseModel):
    resume_text: str


class ResumeInsightsResponse(BaseModel):
    insights: List[Dict[str, Any]]


class ResumeCritiqueResponse(BaseModel):
    critique: List[Dict[str, Any]]


class ResumeScoreResponse(BaseModel):
    analysis: Dict[str, Any]

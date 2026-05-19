from typing import List

from pydantic import BaseModel


class ResumeExtractionResponse(BaseModel):
    text: str
    skills: List[str]

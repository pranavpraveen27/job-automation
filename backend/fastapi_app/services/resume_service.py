from typing import List

from fastapi_app.utils.pdf_extraction import extract_text_from_pdf_bytes
from fastapi_app.utils.skill_parser import parse_skills_from_text


class ResumeService:
    @staticmethod
    async def extract_text(file_bytes: bytes) -> str:
        return extract_text_from_pdf_bytes(file_bytes)

    @staticmethod
    async def extract_skills(text: str) -> List[str]:
        return parse_skills_from_text(text)

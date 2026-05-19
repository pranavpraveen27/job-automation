from ..schemas.cover_letter import CoverLetterRequest
from .qwen_service import QwenService


class CoverLetterService:
    @staticmethod
    async def generate_cover_letter(request: CoverLetterRequest) -> str:
        if not QwenService.is_configured():
            raise RuntimeError("Set OPENROUTER_API_KEY to generate cover letters with the configured OpenRouter model.")

        prompt = f"""
Write a concise, professional cover letter tailored to this role.

Candidate name: {request.candidate_name}
Candidate summary/resume context: {request.candidate_summary}
Skills: {", ".join(request.skills)}

Job title: {request.job_title}
Company: {request.company_name}
Company/job description: {request.company_description}

Requirements:
- Use a warm, confident tone.
- Mention the most relevant skills from the resume context.
- Keep it under 350 words.
- Do not invent companies, degrees, or metrics that are not provided.
"""
        return await QwenService.generate_text(
            prompt,
            "You write personalized job application cover letters.",
            temperature=0.6,
        )

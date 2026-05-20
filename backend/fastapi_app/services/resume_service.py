from typing import List

from fastapi_app.services.groq_service import GroqService
from fastapi_app.utils.pdf_extraction import extract_text_from_pdf_bytes
from fastapi_app.utils.skill_parser import parse_skills_from_text


class ResumeService:
    @staticmethod
    async def extract_text(file_bytes: bytes) -> str:
        return extract_text_from_pdf_bytes(file_bytes)

    @staticmethod
    async def extract_skills(text: str) -> List[str]:
        return parse_skills_from_text(text)

    @staticmethod
    async def extract_structured_data(text: str, skills: List[str]) -> dict:
        fallback = {
            "personalInfo": {},
            "summary": "",
            "experience": [],
            "education": [],
            "skills": [{"name": skill} for skill in skills],
            "certifications": [],
            "projects": [],
            "languages": [],
            "extractionQuality": 70 if text.strip() else 0,
        }
        if not GroqService.is_configured() or not text.strip():
            return fallback

        prompt = f"""
Extract structured resume data from the resume text below.

Return valid JSON only with this exact shape:
{{
  "personalInfo": {{"fullName": "", "email": "", "phone": "", "location": "", "linkedinUrl": "", "githubUrl": "", "portfolioUrl": ""}},
  "summary": "",
  "experience": [{{"company": "", "position": "", "duration": "", "description": "", "highlights": []}}],
  "education": [{{"institution": "", "degree": "", "field": "", "gpa": "", "honors": ""}}],
  "skills": [{{"name": "", "proficiency": "intermediate", "years": null}}],
  "certifications": [{{"name": "", "issuer": "", "credentialId": "", "credentialUrl": ""}}],
  "projects": [{{"name": "", "description": "", "technologies": [], "link": ""}}],
  "languages": [{{"language": "", "proficiency": ""}}],
  "extractionQuality": 0
}}

Use null or empty strings when a field is not present. Keep dates inside text fields unless the exact date is obvious.

RESUME:
{text[:14000]}
"""
        return await GroqService.generate_json(
            prompt,
            fallback,
            "You extract resumes into clean applicant tracking system JSON.",
        )

    @staticmethod
    async def suggest_improvements(text: str) -> List[dict]:
        fallback = [
            {
                "issue": "Groq AI is not configured",
                "recommendation": "Set GROQ_API_KEY in backend/.env, then restart the FastAPI service.",
                "rationale": "Resume suggestions require a Groq API key.",
                "priority": "medium",
            }
        ]
        if not GroqService.is_configured():
            return fallback

        prompt = f"""
Analyze this resume and return 5 to 10 specific improvements as valid JSON array only.
Each item must include: issue, recommendation, rationale, priority.

RESUME:
{text[:14000]}
"""
        return await GroqService.generate_json(prompt, fallback, "You are an expert resume writer.")

    @staticmethod
    async def critique_formatting(text: str) -> List[dict]:
        if not GroqService.is_configured():
            return []

        prompt = f"""
Critique this resume for formatting, readability, visual hierarchy, and ATS compatibility.
Return valid JSON array only. Each item must include: issue, visualImpact, recommendation, severity.

RESUME:
{text[:14000]}
"""
        return await GroqService.generate_json(prompt, [], "You are an expert recruiter and resume formatter.")

    @staticmethod
    async def analyze_quality(text: str) -> dict:
        fallback = {
            "overallScore": 0,
            "summary": "Set GROQ_API_KEY to enable resume quality scoring through Groq.",
        }
        if not GroqService.is_configured():
            return fallback

        prompt = f"""
Score this resume and return valid JSON only.
Include contentQuality, formattingQuality, atsCompatibility, impactPotential, overallScore, summary, and topPriorities.
Each category should include score, strengths, weaknesses, and actionItems.

RESUME:
{text[:14000]}
"""
        return await GroqService.generate_json(prompt, fallback, "You are an expert career coach.")

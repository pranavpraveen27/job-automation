import re
from typing import List

from ..schemas.job import JobMatchResult, JobPosting
from .qwen_service import QwenService


class JobMatchService:
    @staticmethod
    async def match_jobs(candidate_skills: List[str], job_postings: List[JobPosting]) -> List[JobMatchResult]:
        normalized_skills = {skill.strip().lower() for skill in candidate_skills if skill.strip()}
        results: List[JobMatchResult] = []

        for posting in job_postings:
            text = f"{posting.title} {posting.company} {posting.description}".lower()
            matched_skills = [skill for skill in normalized_skills if re.search(rf"\b{re.escape(skill)}\b", text)]
            score = len(matched_skills) / max(len(normalized_skills), 1)

            results.append(
                JobMatchResult(
                    job_id=posting.id,
                    score=round(score, 2),
                    title=posting.title,
                    company=posting.company,
                    matched_skills=matched_skills,
                )
            )

        return sorted(results, key=lambda item: item.score, reverse=True)

    @staticmethod
    async def analyze_resume_job_match(resume_text: str, job_description: str) -> dict:
        fallback = {
            "matchScore": 0,
            "matchingSkills": [],
            "missingSkills": [],
            "assessment": "Set OPENROUTER_API_KEY to enable AI match analysis through OpenRouter.",
        }
        if not QwenService.is_configured():
            return fallback

        prompt = f"""
Compare this resume to the job description and return valid JSON only with:
matchScore (0-100), matchingSkills, missingSkills, assessment, strengths, risks, recommendedNextSteps.

RESUME:
{resume_text[:12000]}

JOB DESCRIPTION:
{job_description[:8000]}
"""
        return await QwenService.generate_json(
            prompt,
            fallback,
            "You are an expert recruiter evaluating candidate-job fit.",
        )

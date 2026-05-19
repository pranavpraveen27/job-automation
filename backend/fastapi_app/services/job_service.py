import re
from typing import List

from ..schemas.job import JobMatchResult, JobPosting


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

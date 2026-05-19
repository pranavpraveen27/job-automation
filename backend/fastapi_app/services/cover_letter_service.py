from ..schemas.cover_letter import CoverLetterRequest


class CoverLetterService:
    @staticmethod
    async def generate_cover_letter(request: CoverLetterRequest) -> str:
        skills_summary = ", ".join(request.skills) if request.skills else "strong transferable skills"
        company_details = f" {request.company_description.strip()}" if request.company_description else ""

        return (
            f"Dear Hiring Team at {request.company_name},\n\n"
            f"I am writing to express my interest in the {request.job_title} position. {request.candidate_summary}"
            f" My experience includes {skills_summary}, and I am excited about the opportunity to contribute to your team.{company_details}\n\n"
            f"I believe my background and skills would be a strong match for this role, and I would welcome the chance to discuss how I can support your goals.\n\n"
            f"Thank you for your consideration.\n\n"
            f"Sincerely,\n"
            f"{request.candidate_name}"
        )

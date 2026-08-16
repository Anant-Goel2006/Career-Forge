"""
CareerForge AI — Cold DM Service.

Generates professional cold outreach emails using Gemini API,
based on a user's resume and a target job.
"""

from typing import Any

from app.services.ai_provider import get_ai_provider


class ColdDMService:
    def __init__(self) -> None:
        self.ai = get_ai_provider()

    async def generate_cold_dm(self, resume_text: str, job_text: str, tone: str = "professional") -> dict[str, str]:
        """
        Generate both a tailored cold email and a LinkedIn connection note based on a resume and job description.
        """
        prompt = f"""
        You are an expert career coach helping a candidate write cold outreach.
        Your task is to write TWO highly customized, concise, and engaging messages to the hiring manager or recruiter.
        
        The tone should be: {tone}.
        
        Guidelines:
        - Do not invent facts, only use what is in the resume.
        - LinkedIn Note: Under 300 characters, extremely concise.
        - Email: Under 150 words, with a subject line.
        - Make a direct connection between the candidate's top relevant skill and the job's core need.
        - Include a clear call to action.
        - Return a JSON object with two keys: "email" and "linkedin".
        """
        
        context = {
            "resume": resume_text,
            "job_description": job_text
        }
        
        from pydantic import BaseModel
        class OutreachVariants(BaseModel):
            email: str
            linkedin: str
            
        try:
            result = await self.ai.generate_structured(
                prompt=prompt,
                response_schema=OutreachVariants,
                context=context
            )
            return result.model_dump()
        except Exception as e:
            return {
                "email": "Error generating email.",
                "linkedin": "Error generating LinkedIn note."
            }

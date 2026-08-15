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

    async def generate_cold_dm(self, resume_text: str, job_text: str, tone: str = "professional") -> str:
        """
        Generate a tailored cold DM/email based on a resume and job description.
        """
        prompt = f"""
        You are an expert career coach helping a candidate write a cold outreach email or direct message (LinkedIn).
        Your task is to write a highly customized, concise, and engaging message to the hiring manager or recruiter.
        
        The tone should be: {tone}.
        
        Guidelines:
        - Do not invent facts, only use what is in the resume.
        - Keep it under 150 words.
        - Make a direct connection between the candidate's top relevant skill and the job's core need.
        - Include a clear call to action.
        - Do NOT include placeholder text like [Your Name], use the information provided or keep it generic if absent.
        - Return ONLY the text of the email/DM, with a subject line at the very top.
        """
        
        context = {
            "resume": resume_text,
            "job_description": job_text
        }
        
        # We use generate_text because we want raw text (the email content)
        return await self.ai.generate_text(prompt=prompt, context=context)

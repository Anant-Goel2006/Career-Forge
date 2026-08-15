"""
CareerForge AI — Tailor Service.

Generates tailored, high-impact resumes tailored to specific jobs.
"""

import logging
from typing import Any

from pydantic import BaseModel, Field

from app.services.ai_provider import AIProvider, get_ai_provider

logger = logging.getLogger(__name__)

class ExperienceEntry(BaseModel):
    title: str
    company: str
    location: str
    dates: str
    bullets: list[str]

class ProjectEntry(BaseModel):
    name: str
    tech: str
    bullets: list[str]

class EducationEntry(BaseModel):
    degree: str
    school: str
    dates: str
    location: str
    gpa: str | None = None

class SkillsEntry(BaseModel):
    languages: str
    frameworks: str
    cloudDevops: str
    databases: str

class TailoredResumeData(BaseModel):
    fullName: str
    contactLine: str
    summary: str
    skills: SkillsEntry
    experience: list[ExperienceEntry]
    projects: list[ProjectEntry]
    certifications: list[str]
    achievements: list[str]
    education: list[EducationEntry]

class JobAnalysisSchema(BaseModel):
    required_skills: list[str] = Field(description="Strict list of required skills")
    preferred_skills: list[str] = Field(description="List of preferred skills")
    seniority: str = Field(description="Seniority level expected (e.g. Entry, Mid, Senior, Lead)")
    key_responsibilities: list[str] = Field(description="Main responsibilities of the role")

class TailorService:
    """
    Synthesize a tailored resume for a specific job based on a parsed base resume.
    """

    def __init__(self, ai_provider: AIProvider | None = None) -> None:
        self._ai = ai_provider or get_ai_provider()

    async def generate_faang_template(
        self,
        base_resume_text: str,
        job_description: str,
        job_title: str,
        company: str,
    ) -> dict[str, Any]:
        """
        Generate a FAANG-style one-pager tailored resume using a strict 2-step pipeline.
        """
        if not self._ai.is_configured:
            # Fallback if no AI
            return {
                "header": {"name": "Candidate", "title": job_title},
                "summary": "Experienced professional seeking a role.",
                "sections": [{"title": "Experience", "content": ["Extracted from base resume"]}]
            }

        # Step 1: Job Analysis
        job_analysis_prompt = "Analyze this job description and extract structured requirements."
        try:
            job_analysis = await self._ai.generate_structured(
                prompt=job_analysis_prompt,
                response_schema=JobAnalysisSchema,
                context={"job_description": job_description}
            )
        except Exception as e:
            logger.error(f"Job analysis failed: {e}")
            job_analysis = JobAnalysisSchema(required_skills=[], preferred_skills=[], seniority="Any", key_responsibilities=[])

        # Step 2: Gap & Tailoring Pass
        prompt = f"""You are an elite career coach. Given a base resume and structured job requirements, create a highly impactful FAANG-style one-pager resume tailored for {company}.

STRICT RULES:
1. NEVER INVENT OR FABRICATE SKILLS. You may only reorder, re-emphasize, and rewrite using the STAR format.
2. The tailored content MUST be derived entirely from the provided base resume text. Treat the base resume as ground truth.
3. If the job requires a skill (e.g. {', '.join(job_analysis.required_skills[:3])}) that is NOT in the resume, DO NOT ADD IT.
4. Keep it concise, punchy, and formatted for a one-pager.
"""
        
        context = {
            "base_resume": base_resume_text,
            "job_requirements": job_analysis.model_dump_json(),
            "target_role": f"{job_title} at {company}",
        }

        try:
            result = await self._ai.generate_structured(
                prompt=prompt,
                response_schema=TailoredResumeData,
                context=context
            )
            return result.model_dump()
        except Exception as e:
            logger.error(f"Tailoring failed: {e}")
            raise

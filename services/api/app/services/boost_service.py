"""
CareerForge AI — Boost Suggestions Service.
"""
from typing import Any
from pydantic import BaseModel
from app.services.ai_provider import AIProvider, get_ai_provider

class BoostSuggestions(BaseModel):
    quick_wins: list[str]
    missing_skills_to_address: list[str]
    bullet_rewrite_suggestions: list[str]
    estimated_score_after_changes: float | None = None

class BoostService:
    def __init__(self, ai_provider: AIProvider | None = None) -> None:
        self._ai = ai_provider or get_ai_provider()

    async def get_boost_suggestions(self, resume_data: dict[str, Any], job_requirements: dict[str, Any], score_breakdown: dict[str, Any]) -> dict[str, Any]:
        prompt = f"""
A candidate is considering applying to this job. Here is their real resume data, the job requirements,
and their ATS score breakdown (already computed by our scoring system — do not recompute or contradict
these numbers, only explain and act on them).

RESUME:
{resume_data}

JOB
{job_requirements.get('title')} at {job_requirements.get('company')}
Required skills: {job_requirements.get('required_skills')}
Preferred skills: {job_requirements.get('preferred_skills')}

SCORE BREAKDOWN
Overall: {score_breakdown.get('overall')}/100
Required skill coverage: {score_breakdown.get('required_skill_coverage')}%
Missing required skills: {score_breakdown.get('missing_required_skills', [])}
Missing preferred skills: {score_breakdown.get('missing_preferred_skills', [])}
Evidence strength (bullets containing a metric): {score_breakdown.get('evidence_strength')}%

TASK
Give the candidate specific, actionable ways to improve their match for THIS job, grounded only in
what's actually true about them from their resume above:

- "quick_wins": 2-4 things they can fix in minutes — reordering, rewording, surfacing a metric they
  likely already have but didn't foreground. Be specific to their actual resume content.
- "missing_skills_to_address": from the missing-skills lists, note which ones they might genuinely have
  unlisted experience with based on evidence elsewhere in their bullets, versus which ones they would
  need to actually go learn.
- "bullet_rewrite_suggestions": 2-3 concrete before/after rewrites of their weakest existing bullets,
  using only real facts already present in the resume.
- "estimated_score_after_changes": a realistic estimate of their overall score if they apply the
  quick_wins. Do not promise 100 — be honest about the ceiling.
"""
        result = await self._ai.generate_structured(
            prompt=prompt,
            response_schema=BoostSuggestions
        )
        return result.model_dump()

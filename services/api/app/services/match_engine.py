"""
CareerForge AI — Match Engine Service.

Deterministic resume-job matching with transparent sub-scores and smart skill alias normalization.
Scoring is NOT AI-driven — it uses algorithmic comparison to ensure reproducible and auditable results.
"""

import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

# Common tech & professional aliases mapping
SKILL_ALIASES: dict[str, list[str]] = {
    "python": ["python", "python3", "py", "django", "fastapi", "flask", "pandas", "numpy"],
    "react": ["react", "react.js", "reactjs", "next.js", "nextjs", "redux"],
    "javascript": ["javascript", "js", "typescript", "ts", "node", "nodejs", "node.js", "es6"],
    "typescript": ["typescript", "ts", "angular", "react", "next.js"],
    "sql": ["sql", "postgresql", "postgres", "mysql", "sqlite", "oracle", "database", "rdbms", "nosql", "mongodb"],
    "java": ["java", "spring", "springboot", "spring boot", "hibernate", "jvm", "kotlin"],
    "c++": ["c++", "cpp", "c", "embedded"],
    "c#": ["c#", "csharp", ".net", "dotnet", "asp.net"],
    "aws": ["aws", "amazon web services", "cloud", "ec2", "s3", "lambda", "gcp", "azure"],
    "cloud": ["cloud", "aws", "gcp", "azure", "google cloud", "devops"],
    "docker": ["docker", "kubernetes", "k8s", "container", "containers", "ci/cd", "cicd", "terraform"],
    "ai": ["ai", "artificial intelligence", "ml", "machine learning", "deep learning", "llm", "nlp", "pytorch", "tensorflow"],
    "machine learning": ["machine learning", "ml", "deep learning", "data science", "pytorch", "tensorflow", "scikit-learn"],
    "api": ["api", "rest", "restful", "graphql", "grpc", "endpoints", "microservices"],
    "system design": ["system design", "architecture", "distributed systems", "scalability", "microservices", "high throughput"],
    "leadership": ["leadership", "led", "mentored", "spearheaded", "managed", "coordinated", "collaborated"],
}

from app.services.ai_provider import AIProvider, get_ai_provider

class MatchEngineService:
    """
    Deterministic resume-job match scoring with transparent sub-scores and semantic aliases.
    """

    WEIGHTS = {
        "required_skill_coverage": 0.30,
        "preferred_skill_coverage": 0.15,
        "semantic_alignment": 0.20,
        "experience_fit": 0.15,
        "education_fit": 0.10,
        "evidence_strength": 0.10,
    }

    def __init__(self, ai_provider: AIProvider | None = None) -> None:
        self._ai = ai_provider or get_ai_provider()

    async def calculate_match(
        self,
        resume_sections: list[dict[str, Any]],
        resume_evidence: list[dict[str, Any]],
        job_requirements: list[dict[str, Any]],
        job_metadata: dict[str, Any],
    ) -> dict[str, Any]:
        """Calculate a comprehensive match between resume and job."""
        required = [r for r in job_requirements if r.get("requirement_type") == "required"]
        preferred = [r for r in job_requirements if r.get("requirement_type") == "preferred"]

        # Build clean resume text for keyword and alias matching
        resume_text = " ".join(
            s.get("raw_text", "") + " " + (s.get("normalized_text", "") or "")
            for s in resume_sections
        ).lower()

        # Build Job text for semantic matching
        job_text = (job_metadata.get("title", "") + " " + job_metadata.get("company", "") + " " + " ".join([r.get("requirement_text", "") for r in job_requirements])).lower()
        
        semantic_score = 75.0
        if self._ai.is_configured and resume_text.strip() and job_text.strip():
            try:
                # Compute Cosine Similarity between resume and JD
                resume_emb = await self._ai.get_embeddings(resume_text[:2000]) # truncated to fit quickly
                job_emb = await self._ai.get_embeddings(job_text[:2000])
                
                # Cosine similarity formula
                dot_product = sum(a * b for a, b in zip(resume_emb, job_emb))
                mag_a = sum(a * a for a in resume_emb) ** 0.5
                mag_b = sum(b * b for b in job_emb) ** 0.5
                if mag_a and mag_b:
                    sim = dot_product / (mag_a * mag_b)
                    # Convert -1 to 1 into 0 to 100
                    semantic_score = round(max(0, (sim * 100)), 1)
            except Exception as e:
                logger.warning(f"Semantic scoring failed: {e}")

        scores = {
            "required_skill_coverage": self._skill_coverage(required, resume_text),
            "preferred_skill_coverage": self._skill_coverage(preferred, resume_text),
            "semantic_alignment": semantic_score,
            "evidence_strength": self._evidence_strength(resume_evidence),
            "experience_fit": self._experience_fit(resume_text, job_metadata),
            "education_fit": self._education_fit(resume_sections, job_requirements),
        }

        # Weighted overall score
        overall = sum(scores[key] * weight for key, weight in self.WEIGHTS.items())
        scores["overall"] = round(min(100, max(0, overall)), 1)

        # Identify missing gaps
        gaps = self._identify_gaps(required, preferred, resume_text)
        
        # LLM Explanation Layer
        explanation = "Great match."
        if self._ai.is_configured:
            try:
                prompt = f"""You are a strict ATS Match Engine evaluator.
Explain this job-resume match score breakdown in two short sentences.
DO NOT output a number. ONLY explain the strengths and gaps.
Scores: {scores}
Gaps: {gaps}
"""
                explanation = await self._ai.generate_text(prompt=prompt)
            except Exception as e:
                logger.error(f"Explanation failed: {e}")

        return {
            "scores": scores,
            "gaps": gaps,
            "explanation": explanation
        }

    def _matches_requirement(self, requirement_text: str, normalized_skill: str | None, resume_text: str) -> bool:
        """Check if a requirement or any of its aliases match within the resume text."""
        target = (normalized_skill or requirement_text).lower().strip()
        if not target:
            return True

        # 1. Direct exact substring match
        if target in resume_text:
            return True

        # 2. Check known aliases
        for alias_key, aliases in SKILL_ALIASES.items():
            if alias_key in target or any(a in target for a in aliases):
                if any(re.search(r"\b" + re.escape(a) + r"\b", resume_text) for a in aliases):
                    return True

        # 3. Individual significant keyword match (words > 3 letters)
        words = [w for w in re.split(r"\W+", target) if len(w) > 3 and w not in {"with", "have", "must", "years", "experience", "building", "using"}]
        if words and any(w in resume_text for w in words):
            return True

        return False

    def _skill_coverage(self, requirements: list[dict[str, Any]], resume_text: str) -> float:
        """Calculate percentage of requirements covered."""
        if not requirements:
            return 100.0

        matched = sum(
            1 for req in requirements
            if self._matches_requirement(req.get("requirement_text", ""), req.get("normalized_skill"), resume_text)
        )
        return round((matched / len(requirements)) * 100, 1)

    def _evidence_strength(self, evidence: list[dict[str, Any]]) -> float:
        """Score the strength of verified evidence items."""
        total = len(evidence)
        if total == 0:
            return 60.0  # Fair baseline

        verified = sum(1 for e in evidence if e.get("verified"))
        base = min(75, total * 6)
        verification_bonus = (verified / total) * 25 if total > 0 else 0
        return round(min(100, base + verification_bonus), 1)

    def _role_fit(self, resume_text: str, job_metadata: dict[str, Any]) -> float:
        """Score role alignment based on title keywords."""
        title = (job_metadata.get("title") or "").lower()
        title_words = [w for w in re.split(r"\W+", title) if len(w) > 3]

        if not title_words:
            return 75.0

        matched = sum(1 for w in title_words if w in resume_text)
        return round(min(100, max(50.0, (matched / len(title_words)) * 100)), 1)

    def _experience_fit(self, resume_text: str, job_metadata: dict[str, Any]) -> float:
        """Score experience level alignment."""
        years_mentioned = re.findall(r"(\d+)\+?\s*years?", resume_text)
        max_years = max([int(y) for y in years_mentioned] + [3])

        level = (job_metadata.get("experience_level") or "").lower()
        if not level:
            return 80.0

        if "senior" in level or "lead" in level:
            return 90.0 if max_years >= 4 else 75.0
        elif "entry" in level or "intern" in level or "junior" in level:
            return 95.0
        return 85.0

    def _education_fit(self, sections: list[dict[str, Any]], requirements: list[dict[str, Any]]) -> float:
        """Score education requirement alignment."""
        edu_sections = [s for s in sections if s.get("section_type") == "education"]
        if not edu_sections:
            return 70.0

        edu_text = " ".join(s.get("raw_text", "") for s in edu_sections).lower()
        has_degree = any(d in edu_text for d in ["bachelor", "master", "phd", "b.s.", "m.s.", "b.tech", "m.tech", "degree", "university", "college"])
        return 95.0 if has_degree else 75.0

    def _location_fit(self, resume_text: str, job_metadata: dict[str, Any]) -> float:
        """Score location compatibility."""
        location = (job_metadata.get("location") or "").lower()
        if not location or "remote" in location:
            return 100.0
        return 90.0

    def _keyword_alignment(self, resume_text: str, requirements: list[dict[str, Any]]) -> float:
        """Score keyword overlap between resume and all requirements."""
        all_keywords: set[str] = set()
        for req in requirements:
            text = req.get("requirement_text", "").lower()
            words = [w for w in re.split(r"\W+", text) if len(w) > 3 and w.isalpha()]
            all_keywords.update(words)

        if not all_keywords:
            return 80.0

        matched = sum(1 for kw in all_keywords if kw in resume_text)
        return round(min(100, max(50.0, (matched / len(all_keywords)) * 100)), 1)

    def _formatting_readiness(self, sections: list[dict[str, Any]]) -> float:
        """Score resume formatting and structure quality."""
        score = 65.0
        section_types = {s.get("section_type") for s in sections}
        standard = {"experience", "education", "skills", "projects"}
        for s in standard:
            if s in section_types:
                score += 8.0
        return min(100, score)

    def _identify_gaps(
        self,
        required: list[dict[str, Any]],
        preferred: list[dict[str, Any]],
        resume_text: str,
    ) -> list[dict[str, Any]]:
        """Identify missing skills/requirements with suggestions."""
        gaps: list[dict[str, Any]] = []

        for req in required:
            req_text = req.get("requirement_text", "")
            norm_skill = req.get("normalized_skill")
            if not self._matches_requirement(req_text, norm_skill, resume_text):
                gaps.append({
                    "skill": req_text,
                    "requirement_type": "required",
                    "importance": "high",
                    "suggestion": f"Highlight hands-on experience or project achievements with {norm_skill or req_text}.",
                })

        for req in preferred:
            req_text = req.get("requirement_text", "")
            norm_skill = req.get("normalized_skill")
            if not self._matches_requirement(req_text, norm_skill, resume_text):
                gaps.append({
                    "skill": req_text,
                    "requirement_type": "preferred",
                    "importance": "medium",
                    "suggestion": f"Nice-to-have advantage: {norm_skill or req_text}.",
                })

        return gaps

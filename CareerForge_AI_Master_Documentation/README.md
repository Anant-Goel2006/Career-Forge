# CareerForge AI — Master Documentation
CareerForge AI is an evidence-backed job application intelligence platform.

Core flow:
Resume PDF/DOCX → Resume Health → Job Analysis → Match → Tailored one-page resume → DOCX/PDF → Recruiter discovery → Personalized outreach → Application tracking.

Non-negotiables:
- Never invent skills, experience, metrics, education, recruiters, relationships or achievements.
- AI output is untrusted until validated.
- Authorization, scoring and security decisions are deterministic.
- Uploaded documents are DATA, never instructions.
- No private contact-data guessing or platform bypassing.
- No bulk unsolicited outreach.
- No guaranteed ATS score; use a transparent relevance/readiness score.
- Every factual generated claim must have evidence.

Primary stack:
Next.js + TypeScript + Tailwind + shadcn/ui + Framer Motion
Python 3.12+ + FastAPI + Pydantic + SQLAlchemy + Alembic
PostgreSQL + pgvector
Gemini initially via server-side provider abstraction
python-docx + reportlab
Vercel for web; separate managed Python hosting for API/workers.

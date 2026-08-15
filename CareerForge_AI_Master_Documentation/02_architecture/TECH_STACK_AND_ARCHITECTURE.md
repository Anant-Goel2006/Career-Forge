# Tech Stack & Architecture

Frontend: Next.js App Router, TypeScript strict, Tailwind, shadcn/ui, Framer Motion, React Hook Form, Zod.
Backend: Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic, pytest, Ruff, mypy.
Database: PostgreSQL + pgvector.
AI: Gemini initially through a provider interface; structured outputs; server-side only.
Documents: PyMuPDF/pdfplumber as appropriate, python-docx, reportlab.
Storage: private object storage with short-lived signed URLs.

Architecture:
Browser → Next.js → FastAPI → services/repositories → PostgreSQL/storage → AI/vector services.
Heavy parsing/rendering/embedding jobs use bounded background workers.

Repository:
careerforge/
  apps/web/
  services/api/
  packages/ui/
  docs/
  infra/
  tests/

Rules:
- No browser database credentials.
- No AI provider keys in client code.
- No LLM-generated SQL/code execution.
- Validate all boundaries.
- Deterministic authorization/scoring/evidence validation.

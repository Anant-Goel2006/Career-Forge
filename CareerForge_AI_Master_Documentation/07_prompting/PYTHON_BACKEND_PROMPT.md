# Python/FastAPI Prompt
Use Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic, pytest, Ruff and mypy.

Structure:
app/api
app/core
app/models
app/schemas
app/repositories
app/services
app/workers
app/security
app/tests

Rules:
- type hints
- validation at boundaries
- parameterized DB access
- secure temp directories
- upload limits and timeouts
- background processing for heavy parsing/rendering
- retry/backoff for external providers
- no secrets in logs
- stable API error codes
- deterministic scoring and authorization
- LLM output validated before persistence
- python-docx for editable Word
- reportlab for PDF

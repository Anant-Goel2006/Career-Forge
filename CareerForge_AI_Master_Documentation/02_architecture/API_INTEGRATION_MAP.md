# API Integration Map

POST /v1/resumes
GET /v1/resumes/{id}
POST /v1/resumes/{id}/audit
POST /v1/jobs/analyze
POST /v1/matches
POST /v1/resume-versions
GET /v1/resume-versions/{id}
POST /v1/resume-versions/{id}/render
GET /v1/jobs
POST /v1/outreach/drafts
GET /v1/applications

External:
- Gemini: controlled extraction/generation; server-side key.
- Embeddings: semantic similarity/RAG.
- Private object storage: resumes and generated documents.
- Email provider: optional, user-initiated only.
- Approved public sources: post-MVP job/contact discovery.

Contracts: typed JSON schemas, pagination, request IDs, idempotency for expensive jobs, structured errors, no secrets in logs.

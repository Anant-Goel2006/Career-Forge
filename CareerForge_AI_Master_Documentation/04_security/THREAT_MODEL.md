# Threat Model

Assets: resumes, PII, job/application history, API keys, generated files, embeddings, AI prompts/responses.

Prompt injection → uploaded text is untrusted data; strict system policy; structured extraction; output validation.
Sensitive information disclosure → data minimization, redaction, secret filtering, no raw content in logs.
Malicious PDF/DOCX → signature/MIME checks, size/page limits, sandboxed processing, timeouts, parser updates.
Broken access control → server-side ownership checks on every resource; tenant isolation tests.
Excessive AI agency → no autonomous sending; allowlisted tools; explicit user confirmation.
RAG poisoning → provenance, trusted-source filtering, retrieved content delimited as data.
Embedding leakage → private vector store, tenant filters, encryption/deletion.
Improper output handling → schema validation, escaping/sanitization.
Unbounded consumption → rate/token/file budgets, timeouts, quotas.
False recruiter information → public-source provenance and confidence; never guess private details.
Supply chain → lockfiles, dependency scanning, minimal dependencies and updates.

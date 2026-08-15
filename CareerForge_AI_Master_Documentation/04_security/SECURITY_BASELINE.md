# Security Baseline
Use OWASP Top 10:2025 and OWASP ASVS as the web-security baseline. Use OWASP GenAI/LLM 2025 risks for AI-specific controls.

Authentication: secure sessions, managed identity where possible.
Authorization: deny-by-default, server-side ownership checks.
Uploads: PDF/DOCX allowlist, signature/MIME validation, size/page/time limits, private storage.
Secrets: server-only environment variables, rotation, separate dev/preview/prod.
API: validation, rate limiting, timeouts, CORS allowlist, security headers, request IDs.
AI: prompt-injection defenses, structured output, token budgets, evidence validation, human approval for external communication.
DB: parameterized queries, least privilege, TLS, backups, deletion workflow.
Logs: structured audit logs, no resume/API-key dumps.

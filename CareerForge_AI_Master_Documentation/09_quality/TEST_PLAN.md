# Test Plan
Unit: parsers, skill normalization, requirement extraction, scoring, evidence validation, STAR constraints, layout rules, filename sanitization, authorization.
Integration: upload→parse→audit; JD→requirements→match; resume→tailor→validate→export; tenant isolation; deletion; RAG filtering.
Security: prompt injection fixtures, malicious document fixtures, oversized/invalid files, XSS, path traversal, unauthorized access, rate limits, secret scanning.
Quality gates: lint, typecheck, unit/integration tests, production build, dependency scan, no unaccepted critical/high findings.

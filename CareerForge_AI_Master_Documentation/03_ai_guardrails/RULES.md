# Rules
1. TypeScript strict mode.
2. Python type hints.
3. Validate every API boundary.
4. No secrets in Git.
5. No NEXT_PUBLIC_ secrets.
6. No direct client LLM calls.
7. Validate all LLM outputs with schemas.
8. Sanitize generated HTML/Markdown.
9. Never execute LLM-generated SQL/code.
10. Parameterized database queries only.
11. Rate limits and token/file budgets on AI/document routes.
12. User/tenant isolation on every resource.
13. Audit sensitive actions.
14. Reuse components.
15. Test security-sensitive services.
16. Deterministic authorization/scoring/evidence validation.
17. AI is advisory, never an authorization engine.

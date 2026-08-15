# Vercel Deployment

Architecture:
Vercel → Next.js frontend.
Separate managed Python host → FastAPI + workers.
Managed PostgreSQL + pgvector.
Private object storage → resumes and generated documents.

Steps:
1. Push Git repository.
2. Import into Vercel.
3. Set root directory to apps/web if monorepo.
4. Configure install/build commands.
5. Add preview and production environment variables separately.
6. Connect domain.
7. Deploy preview.
8. Run smoke/security checks.
9. Promote to production.

Browser-safe:
NEXT_PUBLIC_APP_URL only.

Server-only:
API_BASE_URL, DATABASE_URL, GEMINI_API_KEY, AUTH_SECRET, storage and email secrets.

Never put secrets in NEXT_PUBLIC_*.
Never commit .env.local.
Redeploy after environment-variable changes.
Keep production and preview secrets separate.

CI:
install → lint → typecheck → tests → build → dependency/security audit → preview smoke tests.

Rollback:
retain previous deployment; use backward-compatible migrations and backups.

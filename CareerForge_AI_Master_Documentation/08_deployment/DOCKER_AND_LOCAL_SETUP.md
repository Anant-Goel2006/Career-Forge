# Local Setup
Services: web, api, postgres, optional worker.

Suggested commands:
make dev
make test
make lint
make build
make migrate

Local:
1. Copy .env.example to local environment.
2. Start PostgreSQL.
3. Run migrations.
4. Start FastAPI.
5. Start Next.js.
6. Verify /health and /ready.

Never use production credentials locally.

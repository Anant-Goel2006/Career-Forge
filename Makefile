# ============================================================
# CareerForge AI — Development Commands
# ============================================================

.PHONY: dev dev-web dev-api test test-web test-api lint lint-web lint-api build build-web build-api migrate db-up db-down clean

# ---------- Full Stack ----------
dev: db-up dev-api dev-web

# ---------- Frontend ----------
dev-web:
	cd apps/web && npm run dev

build-web:
	cd apps/web && npm run build

lint-web:
	cd apps/web && npm run lint && npm run typecheck

test-web:
	cd apps/web && npm run test

# ---------- Backend ----------
dev-api:
	cd services/api && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

build-api:
	cd services/api && python -m mypy app/ && python -m ruff check app/

lint-api:
	cd services/api && python -m ruff check app/ && python -m mypy app/

test-api:
	cd services/api && python -m pytest tests/ -v --tb=short

# ---------- Database ----------
db-up:
	docker-compose up -d postgres

db-down:
	docker-compose down

migrate:
	cd services/api && python -m alembic upgrade head

# ---------- Combined ----------
lint: lint-web lint-api
test: test-web test-api
build: build-web build-api

# ---------- Cleanup ----------
clean:
	rm -rf apps/web/.next apps/web/node_modules
	rm -rf services/api/__pycache__ services/api/.pytest_cache services/api/.mypy_cache

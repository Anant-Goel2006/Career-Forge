@echo off
echo Starting CareerForge AI...
echo Make sure Docker Desktop is running for PostgreSQL if you haven't started it yet!
echo.

start cmd /k "cd services/api && title CareerForge Backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
start cmd /k "cd apps/web && title CareerForge Frontend && npm run dev"

echo Development servers started in new windows.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000

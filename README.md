# CareerForge AI

**Evidence-backed job application intelligence platform.**

CareerForge AI is an advanced agentic system designed to ingest resumes, perform robust, layout-aware data extraction, run a deterministic health and readiness audit, and ultimately synthesize FAANG-grade tailored resumes based on target job descriptions.

---

## 🏗 Architecture

The platform operates on a modernized, decoupled architecture designed to overcome the statelessness and package limitations of serverless environments (like Vercel).

* **Frontend:** Next.js (TypeScript, Tailwind CSS)
* **Backend:** Python FastAPI (SQLAlchemy, Pydantic, PyMuPDF, python-docx)
* **AI Provider:** Google Gemini 2.0 (Structured Outputs, text-embedding-004)

### How it works
Next.js acts as the client and UI layer. All API calls to `/api/v1/*` are natively proxied from the frontend to the FastAPI backend. 
The Python backend handles the heavy lifting: PDF/DOCX parsing via `PyMuPDF`, embedding generation via `SentenceTransformers`/`Gemini`, deterministic scoring algorithms, and strict schema-validated LLM extraction.

---

## ✨ Key Features

1. **Native Layout-Aware Extraction:**
   Uses `PyMuPDF` block extraction to sort and parse PDF elements by visual layout, preventing the jumbled text issues common with naive text extractors.
   
2. **Structured LLM Parsing:**
   Utilizes Gemini 2.0's native JSON schema-constrained generation to guarantee the resume data (Experience, Education, Skills) strictly adheres to predefined Pydantic models.

3. **Deterministic & Explainable Scoring:**
   Replaces hallucinated LLM scores with transparent algorithmic auditing. Health and Match scores are computed deterministically (via Cosine Similarity, Regex validation, and Google X-Y-Z formula metrics). The LLM is relegated purely to formatting the human-readable explanation.

4. **Auto-Tailoring Pipeline:**
   Conducts a semantic gap analysis against a provided Job Description and rewrites bullets (maintaining strict factual constraints) into a highly impactful FAANG-style one-pager.

---

## 🚀 Local Development Setup

To run CareerForge AI locally, you must run both the Next.js frontend and the FastAPI backend concurrently.

### 1. Backend (FastAPI) Setup
```bash
cd services/api
# Create a virtual environment (optional but recommended)
python -m venv .venv
# Activate the venv (Windows)
.venv\Scripts\activate
# Install dependencies
pip install -e .

# Start the FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
The backend will run at `http://127.0.0.1:8000`.

### 2. Frontend (Next.js) Setup
In a new terminal window:
```bash
cd apps/web
# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```
The frontend will run at `http://localhost:3000`. Next.js is configured to automatically rewrite and proxy API requests to the local FastAPI backend.

---

## 🌍 Deployment Guide

When deploying to a production environment (like Vercel), you must split the deployments because Python document-processing libraries cannot run in a Node.js serverless environment.

### Deploying the Backend
Deploy the `services/api` directory to a Python-native hosting provider such as **Render**, **Fly.io**, or **Heroku**.
* Set your environment variables (e.g., `GEMINI_API_KEY`).
* Note the resulting production URL (e.g., `https://careerforge-api.onrender.com`).

### Deploying the Frontend (Vercel)
Deploy the `apps/web` directory to **Vercel**.
* In your Vercel Project Settings, add the environment variable:
  `NEXT_PUBLIC_API_BASE_URL=https://careerforge-api.onrender.com`
* Because of the Next.js proxy rewrite configuration, the frontend will transparently route API calls to your newly deployed backend without encountering CORS issues.

import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_job_search(client: AsyncClient):
    """Test job search endpoint."""
    response = await client.get("/v1/jobs/search?keywords=Software Engineer&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # The job search might return empty if the external API fails, but it shouldn't error.

@pytest.mark.asyncio
async def test_tailor_and_docx_render(client: AsyncClient):
    """Test the tailor endpoint and docx rendering."""
    payload = {
        "base_resume_text": '{"fullName": "Test User", "summary": "Software Dev", "skills": {"languages": "Python"}}',
        "job_description": "We need a python developer",
        "job_title": "Python Developer",
        "company": "Tech Corp"
    }
    response = await client.post("/v1/assistant/tailor", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "resume_data" in data
    assert "docx_base64" in data
    assert len(data["docx_base64"]) > 100  # valid base64 docx should be somewhat large

@pytest.mark.asyncio
async def test_assistant_chat(client: AsyncClient):
    """Test the assistant chat endpoint."""
    payload = {
        "message": "How do I write good bullet points?",
        "history": []
    }
    response = await client.post("/v1/assistant/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "suggestions" in data
    assert "X-Y-Z formula" in data["response"] or "STAR" in data["response"] or "actionable" in data["response"].lower()

@pytest.mark.asyncio
async def test_job_recruiter_lookup(client: AsyncClient):
    """Test recruiter lookup endpoint."""
    response = await client.get("/v1/jobs/job-123/recruiter-lookup")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

@pytest.mark.asyncio
async def test_generate_cold_dm(client: AsyncClient):
    """Test cold DM generation."""
    response = await client.post("/v1/jobs/job-123/cold-dm", json={"resume_id": "res-123", "tone": "professional"})
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
    assert "linkedin" in data

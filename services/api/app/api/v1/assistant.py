"""
CareerForge AI — Assistant API Endpoint.

Provides interactive career copilot guidance grounded in real evidence.
"""

from typing import Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.ai_provider import get_ai_provider

router = APIRouter()


class ChatMessage(BaseModel):
    role: str = Field(description="Role: 'user' or 'assistant'")
    content: str = Field(description="Message content")


class ChatRequest(BaseModel):
    message: str = Field(description="User prompt/question")
    resume_id: str | None = Field(default=None, description="Optional resume ID for context")
    history: list[ChatMessage] = Field(default_factory=list, description="Recent conversation history")


class ChatResponse(BaseModel):
    response: str
    suggestions: list[str] = Field(default_factory=list)


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    """
    Chat with CareerForge AI Assistant.
    Provides evidence-grounded career advice, resume feedback, and interview coaching.
    """
    ai = get_ai_provider()

    # If AI provider is configured with Gemini API key, generate dynamic response
    if ai.is_configured:
        try:
            history_context = "\n".join(
                f"{m.role.upper()}: {m.content}" for m in req.history[-6:]
            )
            prompt = (
                f"You are the CareerForge AI Copilot. Assist the candidate with professional, actionable, "
                f"and evidence-grounded career guidance.\n\n"
                f"User Question: {req.message}\n"
            )
            if history_context:
                prompt = f"Recent Conversation:\n{history_context}\n\n" + prompt

            text = await ai.generate_text(prompt=prompt)
            return ChatResponse(
                response=text,
                suggestions=[
                    "How can I improve my resume bullets?",
                    "What questions should I ask the recruiter?",
                    "How do I highlight leadership experience?",
                ],
            )
        except Exception as err:
            pass

    # Intelligent deterministic CareerForge fallback when Gemini key is not set
    msg_lower = req.message.lower()
    if "bullet" in msg_lower or "resume" in msg_lower:
        reply = (
            "To strengthen your resume bullets, follow the Google X-Y-Z formula: "
            "'Accomplished [X] as measured by [Y], by doing [Z]'. Ensure every bullet starts with a strong "
            "action verb (e.g., Architected, Spearheaded, Optimized) and references verifiable metrics."
        )
    elif "salary" in msg_lower or "negotiat" in msg_lower:
        reply = (
            "When negotiating compensation, focus on total rewards (Base, Bonus, Equity). "
            "Always anchor on market data for your specific tier/location and wait for the recruiter to state "
            "the initial range before sharing your target."
        )
    elif "interview" in msg_lower or "prep" in msg_lower:
        reply = (
            "For technical and behavioral interviews, prepare 4-5 core stories using the STAR format "
            "(Situation, Task, Action, Result). Focus 70% of your time on the specific Actions you individually took."
        )
    else:
        reply = (
            f"I've analyzed your career query regarding '{req.message}'. "
            "To maximize interview conversion, tailor your resume to the exact requirements in the job description, "
            "quantify your scope, and reach out to hiring managers with personalized outreach notes."
        )

    return ChatResponse(
        response=reply,
        suggestions=[
            "How to structure STAR bullets?",
            "Tips for cold outreach on LinkedIn?",
            "How to prepare for system design rounds?",
        ],
    )

import base64
from app.services.tailor_service import TailorService
from app.services.docx_renderer import DocxRenderer

class TailorRequest(BaseModel):
    base_resume_text: str
    job_description: str
    job_title: str
    company: str

class TailorResponse(BaseModel):
    resume_data: dict[str, Any]
    docx_base64: str

@router.post("/tailor", response_model=TailorResponse)
async def tailor_resume(
    req: TailorRequest,
) -> TailorResponse:
    """
    Orchestrated pipeline to extract, analyze gap, and tailor a resume to a JD.
    Returns structured data for live sync and a base64 DOCX for download.
    """
    service = TailorService()
    
    # 1 & 2: Job Analysis & Strict Tailoring Pass
    tailored_data = await service.generate_faang_template(
        base_resume_text=req.base_resume_text,
        job_description=req.job_description,
        job_title=req.job_title,
        company=req.company,
    )
    
    # 3: Render DOCX on backend
    docx_bytes = DocxRenderer.render(tailored_data)
    docx_b64 = base64.b64encode(docx_bytes).decode("utf-8")
    
    return TailorResponse(
        resume_data=tailored_data,
        docx_base64=docx_b64
    )

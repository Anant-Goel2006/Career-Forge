"""
CareerForge AI — Resume Parser Service.

Handles PDF/DOCX parsing with multi-layer section classification and evidence extraction.
Robust against diverse resume formats (LinkedIn PDF exports, single/multi-column layouts).
"""

import logging
import re
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.core.exceptions import UnsupportedFileTypeError, ValidationError
from app.services.ai_provider import AIProvider, get_ai_provider

logger = logging.getLogger(__name__)


class ParsedSection(BaseModel):
    section_type: str = Field(
        description="One of: summary, experience, education, skills, projects, certifications, awards, publications, contact, general"
    )
    raw_text: str = Field(description="The exact text content belonging to this section")


class ParsedResumeData(BaseModel):
    sections: list[ParsedSection]


# Comprehensive Section Header Patterns
SECTION_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("skills", re.compile(r"(?i)^(top\s*skills|skills|technical\s*skills|core\s*competencies|technologies|technical\s*expertise|key\s*skills|skill\s*set|skills\s*&\s*abilities|tools\s*&\s*technologies)\s*[:\-]?\s*$")),
    ("summary", re.compile(r"(?i)^(summary|professional\s*summary|profile|about|about\s*me|objective|career\s*objective|executive\s*summary)\s*[:\-]?\s*$")),
    ("experience", re.compile(r"(?i)^(experience|work\s*experience|employment|work\s*history|professional\s*experience|internships?|internship\s*experience)\s*[:\-]?\s*$")),
    ("education", re.compile(r"(?i)^(education|academic|qualifications|academic\s*background|academic\s*qualifications)\s*[:\-]?\s*$")),
    ("projects", re.compile(r"(?i)^(projects|personal\s*projects|key\s*projects|academic\s*projects|featured\s*projects)\s*[:\-]?\s*$")),
    ("certifications", re.compile(r"(?i)^(certifications?|licenses?|credentials?|certificates?|courses?)\s*[:\-]?\s*$")),
    ("awards", re.compile(r"(?i)^(awards?|honors?|achievements?|honors[\s\-_]*awards?|honors\s*&\s*awards)\s*[:\-]?\s*$")),
    ("publications", re.compile(r"(?i)^(publications?|papers?|research)\s*[:\-]?\s*$")),
    ("contact", re.compile(r"(?i)^(contact|personal\s*info|details|contact\s*information|contact\s*details)\s*[:\-]?\s*$")),
    ("languages", re.compile(r"(?i)^(languages?|spoken\s*languages?)\s*[:\-]?\s*$")),
]

COMMON_TECH_KEYWORDS = {
    "python", "sql", "power bi", "powerbi", "pandas", "numpy", "machine learning",
    "r", "data analytics", "data analysis", "data visualization", "excel",
    "javascript", "typescript", "react", "node.js", "java", "c++", "go",
    "docker", "kubernetes", "aws", "azure", "gcp", "fastapi", "django"
}


class ResumeParser:
    """
    Parse PDF/DOCX resumes into structured sections with high-fidelity evidence extraction.
    """

    def __init__(self, ai_provider: AIProvider | None = None) -> None:
        self._settings = get_settings()
        self._ai = ai_provider or get_ai_provider()

    def validate_file(self, filepath: Path) -> str:
        """Validate a resume file's type, size, and signature."""
        suffix = filepath.suffix.lower()
        if suffix not in self._settings.allowed_upload_extensions:
            raise UnsupportedFileTypeError(self._settings.allowed_upload_extensions)

        file_size = filepath.stat().st_size
        if file_size > self._settings.max_upload_size_bytes:
            raise ValidationError(
                f"File size ({file_size} bytes) exceeds limit ({self._settings.max_upload_size_bytes} bytes)."
            )

        file_type = self._detect_type_by_signature(filepath)
        if file_type is None:
            raise UnsupportedFileTypeError(self._settings.allowed_upload_extensions)

        return file_type

    def _detect_type_by_signature(self, filepath: Path) -> str | None:
        """Detect file type by reading magic bytes."""
        with open(filepath, "rb") as f:
            header = f.read(8)

        if header[:4] == b"%PDF":
            return "pdf"
        if header[:4] == b"PK\x03\x04":
            return "docx"
        return None

    async def parse_pdf(self, filepath: Path) -> dict[str, Any]:
        """Parse a PDF resume into text and sections."""
        import fitz  # PyMuPDF

        doc = fitz.open(str(filepath))
        try:
            page_count = len(doc)
            if page_count > self._settings.max_resume_pages:
                raise ValidationError(
                    f"PDF has {page_count} pages (max: {self._settings.max_resume_pages})."
                )

            full_text = ""
            for page in doc:
                # Use "blocks" extraction to preserve physical layout ordering
                blocks = page.get_text("blocks")
                # Sort blocks by Y coordinate (vertical position), then X coordinate
                blocks.sort(key=lambda b: (b[1], b[0]))
                for b in blocks:
                    if b[6] == 0:  # 0 indicates a text block
                        full_text += b[4] + "\n"

            sections = await self._identify_sections(full_text)

            return {
                "raw_text": full_text.strip(),
                "sections": sections,
                "page_count": page_count,
                "metadata": {
                    "format": "pdf",
                    "page_count": page_count,
                    "extraction_method": "layout-aware-blocks"
                },
            }
        finally:
            doc.close()

    async def parse_docx(self, filepath: Path) -> dict[str, Any]:
        """Parse a DOCX resume into text and sections."""
        import docx

        doc = docx.Document(str(filepath))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        full_text = "\n".join(paragraphs)

        sections = await self._identify_sections(full_text)

        return {
            "raw_text": full_text.strip(),
            "sections": sections,
            "page_count": 1,
            "metadata": {
                "format": "docx",
                "paragraph_count": len(paragraphs),
            },
        }

    async def parse(self, filepath: Path) -> dict[str, Any]:
        """Parse a resume file (PDF or DOCX) into structured data."""
        file_type = self.validate_file(filepath)

        if file_type == "pdf":
            return await self.parse_pdf(filepath)
        elif file_type == "docx":
            return await self.parse_docx(filepath)
        else:
            raise UnsupportedFileTypeError()

    async def _identify_sections(self, text: str) -> list[dict[str, Any]]:
        """Identify resume sections from raw text."""
        if self._ai.is_configured:
            prompt = """You are an expert resume parser. Extract the resume into strict structured sections.
Classify each section into one of: summary, experience, education, skills, projects, certifications, awards, contact, general.

FEW-SHOT EXAMPLES:

Example 1 (Clean):
Input:
John Doe
johndoe@email.com
Experience
Software Engineer at TechCorp (2020-2023)
- Built an API using Python

Output:
[
  {"section_type": "contact", "raw_text": "John Doe\\njohndoe@email.com"},
  {"section_type": "experience", "raw_text": "Software Engineer at TechCorp (2020-2023)\\n- Built an API using Python"}
]

Example 2 (Messy/No Headers):
Input:
Jane Smith | 555-1234
Java, C++, Spring Boot
Worked at Initech as Developer
Graduated MIT 2019

Output:
[
  {"section_type": "contact", "raw_text": "Jane Smith | 555-1234"},
  {"section_type": "skills", "raw_text": "Java, C++, Spring Boot"},
  {"section_type": "experience", "raw_text": "Worked at Initech as Developer"},
  {"section_type": "education", "raw_text": "Graduated MIT 2019"}
]

Example 3 (Complex Columns):
Input:
Skills         Experience
Python         Data Analyst, Acme Corp
SQL            - Analyzed data

Output:
[
  {"section_type": "skills", "raw_text": "Python\\nSQL"},
  {"section_type": "experience", "raw_text": "Data Analyst, Acme Corp\\n- Analyzed data"}
]

Now, parse the following resume text EXACTLY as it appears into the required schema:"""
            try:
                result = await self._ai.generate_structured(
                    prompt=prompt,
                    response_schema=ParsedResumeData,
                    context={"resume_text": text}
                )
                
                # Lightweight cross-check
                has_email_regex = bool(re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text))
                llm_text = " ".join(sec.raw_text for sec in result.sections).lower()
                has_email_llm = bool(re.search(r"[\w\.-]+@[\w\.-]+\.\w+", llm_text))
                
                confidence = "high"
                if has_email_regex and not has_email_llm:
                    confidence = "low"
                    logger.warning("LLM extraction missed email detected by regex.")
                    
                if result.sections:
                    return [
                        {
                            "section_type": sec.section_type,
                            "raw_text": sec.raw_text,
                            "order_index": i,
                            "confidence": confidence
                        }
                        for i, sec in enumerate(result.sections)
                    ]
            except Exception as e:
                logger.warning(f"AI section segmentation fallback: {e}")

        return self._identify_sections_regex(text)

    def _identify_sections_regex(self, text: str) -> list[dict[str, Any]]:
        """Identify resume sections using header matching."""
        lines = text.split("\n")
        sections: list[dict[str, Any]] = []
        current_section_type = "contact"
        current_lines: list[str] = []

        for line in lines:
            stripped = line.strip()
            matched_type = self._match_section_header(stripped)

            if matched_type:
                # Save preceding section
                if current_lines:
                    text_content = "\n".join(current_lines).strip()
                    if text_content:
                        sections.append({
                            "section_type": current_section_type,
                            "raw_text": text_content,
                            "order_index": len(sections),
                        })
                current_section_type = matched_type
                current_lines = []
            else:
                current_lines.append(line)

        # Save final section
        if current_lines:
            text_content = "\n".join(current_lines).strip()
            if text_content:
                sections.append({
                    "section_type": current_section_type,
                    "raw_text": text_content,
                    "order_index": len(sections),
                })

        # Check if skills section was found; if not, check for embedded skills
        section_types = {s["section_type"] for s in sections}
        if "skills" not in section_types:
            found_skills = [k for k in COMMON_TECH_KEYWORDS if k in text.lower()]
            if found_skills:
                sections.append({
                    "section_type": "skills",
                    "raw_text": ", ".join(s.title() for s in found_skills),
                    "order_index": len(sections),
                })

        return sections

    def _match_section_header(self, text: str) -> str | None:
        """Match a line against section header regex patterns."""
        if not text or len(text) > 80:
            return None

        # Clean punctuation & whitespace
        cleaned = text.strip().rstrip(":")

        for section_type, pattern in SECTION_PATTERNS:
            if pattern.match(cleaned):
                return section_type

        return None

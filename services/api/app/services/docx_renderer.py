"""
DOCX Renderer Service.
"""
from io import BytesIO
from typing import Any
import docx
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

class DocxRenderer:
    @staticmethod
    def render(resume_data: dict[str, Any]) -> bytes:
        """Render a TailoredResumeData JSON into a FAANG-style DOCX file."""
        doc = docx.Document()
        
        # Set minimal margins for 1-pager
        sections = doc.sections
        for section in sections:
            section.top_margin = Inches(0.5)
            section.bottom_margin = Inches(0.5)
            section.left_margin = Inches(0.5)
            section.right_margin = Inches(0.5)
            
        # Name
        name_p = doc.add_paragraph()
        name_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        name_run = name_p.add_run(resume_data.get("fullName", "Candidate Name"))
        name_run.bold = True
        name_run.font.size = Pt(20)
        
        # Contact
        contact_p = doc.add_paragraph()
        contact_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        contact_run = contact_p.add_run(resume_data.get("contactLine", ""))
        contact_run.font.size = Pt(10)
        
        # Summary
        summary = resume_data.get("summary", "")
        if summary:
            doc.add_paragraph()
            sum_p = doc.add_paragraph(summary)
            sum_p.style.font.size = Pt(10)

        # Experience
        experience = resume_data.get("experience", [])
        if experience:
            doc.add_heading("PROFESSIONAL EXPERIENCE", level=2)
            for exp in experience:
                p = doc.add_paragraph()
                p.add_run(exp.get("title", "")).bold = True
                p.add_run(f" | {exp.get('company', '')}")
                
                for bullet in exp.get("bullets", []):
                    b = doc.add_paragraph(bullet, style='List Bullet')
                    b.style.font.size = Pt(10)
                
        # Save to bytes
        io = BytesIO()
        doc.save(io)
        return io.getvalue()

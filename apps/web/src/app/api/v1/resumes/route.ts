/**
 * CareerForge AI — Server-side Resume Parsing (Next.js API Route).
 *
 * Uses pdf-parse for PDFs and mammoth for DOCX — both work on Vercel serverless.
 * Calls Gemini for structured extraction, then scores deterministically.
 */

import { NextRequest, NextResponse } from "next/server";

// Dynamic import to avoid bundling issues
async function extractPdfText(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// Resume validation: check if extracted text looks like a resume
function isLikelyResume(text: string): { valid: boolean; reason: string } {
  const lower = text.toLowerCase();
  const wordCount = text.split(/\s+/).length;

  if (wordCount < 30) {
    return { valid: false, reason: "File contains too little text to be a resume." };
  }

  // Check for at least 2 resume-like indicators
  const indicators = [
    /experience|work\s*history|employment/i,
    /education|university|college|bachelor|master|degree/i,
    /skills|technologies|proficien/i,
    /projects?|portfolio/i,
    /certif|award|honor|achievement/i,
    /summary|objective|profile/i,
    /@[\w.-]+\.\w+/, // email pattern
    /\(\d{3}\)\s*\d{3}|[\+]?\d[\d\s\-]{8,}/, // phone pattern
    /linkedin\.com|github\.com/i,
  ];

  const matchCount = indicators.filter((r) => r.test(text)).length;

  if (matchCount < 2) {
    return {
      valid: false,
      reason: "This file does not appear to be a resume. Please upload a resume/CV document containing your experience, education, and skills.",
    };
  }

  return { valid: true, reason: "" };
}

// Deterministic section parser (no LLM needed for basic parsing)
function parseResumeText(rawText: string, filename: string) {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);

  // Section header patterns
  const sectionPatterns: Record<string, RegExp> = {
    summary: /^(professional\s*)?summary|^(career\s*)?objective|^profile/i,
    experience: /^(professional\s*|work\s*)?experience|^employment|^work\s*history/i,
    education: /^education|^academic/i,
    skills: /^(technical\s*)?(skills|competenc|technologies|proficienc)/i,
    projects: /^(key\s*|technical\s*)?projects?|^portfolio/i,
    certifications: /^certif|^licens/i,
    achievements: /^(key\s*)?achieve|^awards?|^honors?/i,
  };

  const sections: Array<{
    id: string;
    section_type: string;
    raw_text: string;
    normalized_text: string | null;
    order_index: number;
  }> = [];

  // Extract contact info from first few lines
  const contactLines: string[] = [];
  let contentStart = 0;

  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    // Check if this looks like a section header — if so, stop collecting contact
    const isHeader = Object.values(sectionPatterns).some((p) => p.test(line));
    if (isHeader) break;
    contactLines.push(line);
    contentStart = i + 1;
  }

  sections.push({
    id: "sec-contact",
    section_type: "contact",
    raw_text: contactLines.join("\n"),
    normalized_text: contactLines.join(" | "),
    order_index: 0,
  });

  // Parse remaining lines into sections
  let currentSection = "other";
  let currentLines: string[] = [];
  let sectionIndex = 1;

  function flushSection() {
    if (currentLines.length > 0 && currentSection !== "other") {
      sections.push({
        id: `sec-${sectionIndex}`,
        section_type: currentSection,
        raw_text: currentLines.join("\n"),
        normalized_text: currentLines.join(" "),
        order_index: sectionIndex,
      });
      sectionIndex++;
    }
    currentLines = [];
  }

  for (let i = contentStart; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line is a section header
    let matchedSection: string | null = null;
    for (const [secType, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line)) {
        matchedSection = secType;
        break;
      }
    }

    if (matchedSection) {
      flushSection();
      currentSection = matchedSection;
    } else {
      currentLines.push(line);
    }
  }
  flushSection();

  // If we didn't find structured sections, do a heuristic split
  if (sections.length <= 1) {
    // Split into approximate sections based on line count
    const totalContent = lines.slice(contentStart);

    // Try to find skills by looking for tech keyword clusters
    const techKeywords = [
      "Python", "SQL", "JavaScript", "TypeScript", "React", "Node.js", "Java",
      "C++", "Go", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Pandas",
      "NumPy", "Power BI", "Excel", "Git", "PostgreSQL", "MongoDB", "Redis",
      "FastAPI", "Django", "Flask", "TailwindCSS", "HTML", "CSS", "Rust",
      "Kotlin", "Swift", "Ruby", "PHP", "Scala", "R", "MATLAB",
      "TensorFlow", "PyTorch", "Scikit-learn", "Spark", "Hadoop",
      "Linux", "CI/CD", "GraphQL", "REST", "API", "Agile", "Scrum",
    ];

    const foundSkills = techKeywords.filter((k) =>
      rawText.toLowerCase().includes(k.toLowerCase())
    );

    if (foundSkills.length > 0) {
      sections.push({
        id: `sec-skills`,
        section_type: "skills",
        raw_text: foundSkills.join(", "),
        normalized_text: foundSkills.join(", "),
        order_index: sectionIndex++,
      });
    }

    // Try to extract summary (first paragraph after contact)
    if (totalContent.length > 3) {
      sections.push({
        id: `sec-summary`,
        section_type: "summary",
        raw_text: totalContent.slice(0, 3).join("\n"),
        normalized_text: totalContent.slice(0, 3).join(" "),
        order_index: sectionIndex++,
      });
    }

    // Rest as experience
    if (totalContent.length > 3) {
      sections.push({
        id: `sec-experience`,
        section_type: "experience",
        raw_text: totalContent.slice(3).join("\n"),
        normalized_text: totalContent.slice(3).join(" "),
        order_index: sectionIndex++,
      });
    }
  }

  // Extract evidence items (bullet points with metrics)
  const evidenceItems = lines
    .filter((l) => /\d+%|\$[\d,]+|\d+[xX]|\d+\+|improved|reduced|increased|optimized|achieved/i.test(l))
    .slice(0, 10)
    .map((claim, idx) => ({
      id: `ev-${idx}`,
      claim_text: claim.replace(/^[-•*]\s*/, ""),
      source_span: null,
      verified: /\d+%|\$[\d,]+|\d+[xX]/.test(claim),
    }));

  return {
    id: `resume-${Date.now()}`,
    original_filename: filename,
    source_type: filename.toLowerCase().endsWith(".pdf") ? "PDF" : "DOCX",
    status: "parsed",
    sections,
    evidence_items: evidenceItems,
    created_at: new Date().toISOString(),
  };
}

// Deterministic scoring based on actual extracted content
function scoreResume(parsed: ReturnType<typeof parseResumeText>): {
  overall_score: number;
  issues: Array<{
    severity: string;
    category: string;
    message: string;
    suggestion: string;
    section: string;
    line_reference: null;
  }>;
  summary: string;
  strengths: string[];
} {
  let score = 50; // Start at 50, earn points for quality signals
  const issues: Array<{
    severity: string;
    category: string;
    message: string;
    suggestion: string;
    section: string;
    line_reference: null;
  }> = [];
  const strengths: string[] = [];

  const allText = parsed.sections.map((s) => s.raw_text).join("\n");
  const allTextLower = allText.toLowerCase();

  // 1. Contact info completeness (+10)
  const contactSection = parsed.sections.find((s) => s.section_type === "contact");
  const contactText = contactSection?.raw_text || "";
  const hasEmail = /@[\w.-]+\.\w+/.test(contactText) || /@[\w.-]+\.\w+/.test(allText);
  const hasPhone = /\(\d{3}\)\s*\d{3}|[\+]?\d[\d\s\-]{8,}/.test(contactText) || /\(\d{3}\)\s*\d{3}|[\+]?\d[\d\s\-]{8,}/.test(allText);
  const hasLinkedIn = /linkedin/i.test(allText);

  if (hasEmail) score += 3;
  else issues.push({ severity: "critical", category: "Contact", message: "No email address found", suggestion: "Add a professional email address to your resume header.", section: "contact", line_reference: null });

  if (hasPhone) score += 3;
  else issues.push({ severity: "warning", category: "Contact", message: "No phone number found", suggestion: "Add a contact phone number.", section: "contact", line_reference: null });

  if (hasLinkedIn) { score += 4; strengths.push("LinkedIn profile included"); }
  else issues.push({ severity: "info", category: "Contact", message: "No LinkedIn profile URL", suggestion: "Add your LinkedIn URL for professional credibility.", section: "contact", line_reference: null });

  // 2. Skills section quality (+15)
  const skillsSection = parsed.sections.find((s) => s.section_type === "skills");
  const techKeywords = ["python", "sql", "javascript", "typescript", "react", "node.js", "java", "docker", "aws", "git", "postgresql", "mongodb"];
  const foundTechCount = techKeywords.filter((k) => allTextLower.includes(k)).length;

  if (foundTechCount >= 6) { score += 15; strengths.push(`Strong technical skills coverage (${foundTechCount} key technologies)`); }
  else if (foundTechCount >= 3) { score += 10; strengths.push(`Good technical skills (${foundTechCount} technologies detected)`); }
  else if (foundTechCount >= 1) { score += 5; issues.push({ severity: "warning", category: "Skills", message: "Limited technical skills detected", suggestion: "Add more specific technologies and tools you're proficient in.", section: "skills", line_reference: null }); }
  else { issues.push({ severity: "critical", category: "Skills", message: "No recognizable technical skills found", suggestion: "Add a dedicated Skills section listing your technical competencies.", section: "skills", line_reference: null }); }

  // 3. Experience quality (+15)
  const expSection = parsed.sections.find((s) => s.section_type === "experience");
  const expText = expSection?.raw_text || "";
  const actionVerbs = ["developed", "engineered", "designed", "implemented", "built", "led", "managed", "optimized", "reduced", "increased", "achieved", "delivered", "automated", "architected", "collaborated"];
  const foundVerbs = actionVerbs.filter((v) => allTextLower.includes(v)).length;

  if (foundVerbs >= 5) { score += 10; strengths.push("Strong action verbs in experience descriptions"); }
  else if (foundVerbs >= 2) { score += 5; }
  else { issues.push({ severity: "warning", category: "Impact", message: "Few action verbs detected", suggestion: "Start bullet points with strong action verbs (Developed, Engineered, Led, Optimized).", section: "experience", line_reference: null }); }

  // 4. Quantified metrics (+10)
  const metricPatterns = /\d+%|\$[\d,]+|\d+[xX]\b|\d+K|\d+M|\d+\+\s*(user|event|request|transaction|client)/i;
  const metricMatches = allText.match(new RegExp(metricPatterns.source, "gi")) || [];
  
  if (metricMatches.length >= 4) { score += 10; strengths.push(`Excellent quantified impact (${metricMatches.length} metrics)`); }
  else if (metricMatches.length >= 2) { score += 6; strengths.push("Some quantified achievements"); }
  else if (metricMatches.length >= 1) { score += 3; issues.push({ severity: "warning", category: "Impact", message: "Limited quantifiable metrics", suggestion: "Use Google X-Y-Z formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.", section: "experience", line_reference: null }); }
  else { issues.push({ severity: "critical", category: "Impact", message: "No quantifiable metrics found in bullet points", suggestion: "Add specific numbers: percentages, dollar amounts, user counts, or time savings.", section: "experience", line_reference: null }); }

  // 5. Education (+5)
  const eduSection = parsed.sections.find((s) => s.section_type === "education");
  if (eduSection && eduSection.raw_text.length > 10) { score += 5; strengths.push("Education section present"); }
  else issues.push({ severity: "info", category: "Education", message: "No education section detected", suggestion: "Add your educational qualifications.", section: "education", line_reference: null });

  // 6. Projects (+5)
  const projSection = parsed.sections.find((s) => s.section_type === "projects");
  if (projSection && projSection.raw_text.length > 10) { score += 5; strengths.push("Technical projects section included"); }
  else issues.push({ severity: "info", category: "Projects", message: "No projects section detected", suggestion: "Add 1-2 key technical projects to demonstrate hands-on ability.", section: "projects", line_reference: null });

  // 7. Overall length check
  const wordCount = allText.split(/\s+/).length;
  if (wordCount >= 200 && wordCount <= 800) { score += 5; }
  else if (wordCount < 200) { issues.push({ severity: "warning", category: "Content", message: "Resume is too short", suggestion: "Expand your resume with more detail about your experience and projects.", section: "experience", line_reference: null }); }

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  return {
    overall_score: score,
    issues,
    summary: `Resume analyzed with a deterministic evidence readiness score of ${score}/100 based on ${parsed.sections.length} sections, ${parsed.evidence_items.length} evidence items, and ${foundTechCount} technical skills detected.`,
    strengths,
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "No file uploaded.", detail: {} } },
        { status: 400 }
      );
    }

    // Validate file extension
    const ext = file.name.toLowerCase().split(".").pop();
    if (!ext || !["pdf", "docx"].includes(ext)) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: `Invalid file type '.${ext}'. Please upload a PDF or DOCX file.`, detail: {} } },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "File exceeds 10MB limit.", detail: {} } },
        { status: 400 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text based on file type
    let rawText: string;
    try {
      if (ext === "pdf") {
        rawText = await extractPdfText(buffer);
      } else {
        rawText = await extractDocxText(buffer);
      }
    } catch (extractErr) {
      return NextResponse.json(
        { error: { code: "EXTRACTION_ERROR", message: "Failed to extract text from document. The file may be corrupted or password-protected.", detail: {} } },
        { status: 422 }
      );
    }

    // Validate it's actually a resume
    const validation = isLikelyResume(rawText);
    if (!validation.valid) {
      return NextResponse.json(
        { error: { code: "NOT_A_RESUME", message: validation.reason, detail: {} } },
        { status: 422 }
      );
    }

    // Parse the resume
    const parsed = parseResumeText(rawText, file.name);

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("Resume upload error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to process resume.", detail: {} } },
      { status: 500 }
    );
  }
}

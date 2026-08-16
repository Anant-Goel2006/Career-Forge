/**
 * CareerForge AI — Resume Health Audit Endpoint.
 * Accepts POST with resume data and returns deterministic scoring.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const resume = body.resume;

    if (!resume || !resume.sections) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Resume data required.", detail: {} } },
        { status: 400 }
      );
    }

    const allText = resume.sections.map((s: any) => s.raw_text || "").join("\n");
    const allTextLower = allText.toLowerCase();

    let score = 50;
    const issues: any[] = [];
    const strengths: string[] = [];

    // 1. Contact info (+10)
    const hasEmail = /@[\w.-]+\.\w+/.test(allText);
    const hasPhone = /\(\d{3}\)\s*\d{3}|[\+]?\d[\d\s\-]{8,}/.test(allText);
    const hasLinkedIn = /linkedin/i.test(allText);

    if (hasEmail) score += 3; else issues.push({ severity: "critical", category: "Contact", message: "No email address found", suggestion: "Add a professional email address.", section: "contact", line_reference: null });
    if (hasPhone) score += 3; else issues.push({ severity: "warning", category: "Contact", message: "No phone number found", suggestion: "Add a contact phone number.", section: "contact", line_reference: null });
    if (hasLinkedIn) { score += 4; strengths.push("LinkedIn profile included"); }

    // 2. Skills (+15)
    const techKeywords = ["python", "sql", "javascript", "typescript", "react", "node.js", "java", "docker", "aws", "git", "postgresql", "mongodb"];
    const foundTechCount = techKeywords.filter((k) => allTextLower.includes(k)).length;

    if (foundTechCount >= 6) { score += 15; strengths.push(`Strong technical skills coverage (${foundTechCount} key technologies)`); }
    else if (foundTechCount >= 3) { score += 10; strengths.push(`Good technical skills (${foundTechCount} technologies detected)`); }
    else if (foundTechCount >= 1) { score += 5; issues.push({ severity: "warning", category: "Skills", message: "Limited technical skills", suggestion: "Add more specific technologies.", section: "skills", line_reference: null }); }
    else issues.push({ severity: "critical", category: "Skills", message: "No recognizable technical skills found", suggestion: "Add a dedicated Skills section.", section: "skills", line_reference: null });

    // 3. Action verbs (+10)
    const actionVerbs = ["developed", "engineered", "designed", "implemented", "built", "led", "managed", "optimized", "reduced", "increased", "achieved", "delivered", "automated", "architected"];
    const foundVerbs = actionVerbs.filter((v) => allTextLower.includes(v)).length;

    if (foundVerbs >= 5) { score += 10; strengths.push("Strong action verbs"); }
    else if (foundVerbs >= 2) score += 5;
    else issues.push({ severity: "warning", category: "Impact", message: "Few action verbs detected", suggestion: "Start bullets with strong action verbs.", section: "experience", line_reference: null });

    // 4. Metrics (+10)
    const metricMatches = allText.match(/\d+%|\$[\d,]+|\d+[xX]\b|\d+K|\d+M/gi) || [];
    if (metricMatches.length >= 4) { score += 10; strengths.push(`Excellent quantified impact (${metricMatches.length} metrics)`); }
    else if (metricMatches.length >= 2) { score += 6; strengths.push("Some quantified achievements"); }
    else if (metricMatches.length >= 1) { score += 3; issues.push({ severity: "warning", category: "Impact", message: "Limited quantifiable metrics", suggestion: "Use Google X-Y-Z formula.", section: "experience", line_reference: null }); }
    else issues.push({ severity: "critical", category: "Impact", message: "No quantifiable metrics found", suggestion: "Add specific numbers: percentages, dollar amounts, time savings.", section: "experience", line_reference: null });

    // 5. Section checks (+10)
    const sectionTypes = resume.sections.map((s: any) => s.section_type);
    if (sectionTypes.includes("education")) { score += 5; strengths.push("Education section present"); }
    if (sectionTypes.includes("projects")) { score += 5; strengths.push("Technical projects included"); }

    score = Math.max(0, Math.min(100, score));

    return NextResponse.json({
      resume_id: id,
      overall_score: score,
      issues,
      summary: `Resume analyzed with a deterministic score of ${score}/100 based on ${resume.sections.length} sections, ${resume.evidence_items?.length || 0} evidence items, and ${foundTechCount} technical skills.`,
      strengths,
    });
  } catch (err) {
    console.error("Audit error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Audit failed.", detail: {} } },
      { status: 500 }
    );
  }
}

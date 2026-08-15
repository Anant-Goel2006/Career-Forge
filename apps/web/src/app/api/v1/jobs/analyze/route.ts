import { NextRequest, NextResponse } from "next/server";

import { matchesSkill } from "@/lib/utils";
import { serverStore } from "@/lib/server-store";

export async function POST(req: NextRequest) {
  try {
    const { description, company, title, location } = await req.json();

    if (!description || description.trim().length < 20) {
      return NextResponse.json(
        { error: { message: "Job description must be at least 20 characters.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const jobId = `job-custom-${Date.now()}`;
    const descLower = description.toLowerCase();

    // Extract skills from JD
    const techKeywords = [
      "Python", "SQL", "JavaScript", "TypeScript", "React", "Node.js", "Java",
      "C++", "Go", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Pandas",
      "NumPy", "Power BI", "Excel", "Git", "PostgreSQL", "MongoDB", "FastAPI",
      "System Design", "Distributed Systems", "Machine Learning", "EDA", "CI/CD"
    ];

    const matchedSkills = techKeywords.filter((k) => matchesSkill(description, k));
    const requirements = (matchedSkills.length > 0 ? matchedSkills : ["Python", "SQL", "Problem Solving"]).map(
      (skill, idx) => ({
        id: `req-${idx + 1}`,
        requirement_type: idx < 3 ? "required" : "preferred",
        requirement_text: `Demonstrated hands-on experience and proficiency in ${skill}.`,
        normalized_skill: skill,
        priority: idx < 3 ? 1 : 2,
      })
    );

    const jobResult = {
      id: jobId,
      source: "custom_analyzer",
      company: company || "Target Company",
      title: title || "Target Role",
      location: location || "Remote / Hybrid",
      employment_type: "Full-time",
      experience_level: descLower.includes("senior") ? "Senior" : descLower.includes("lead") ? "Lead" : "Entry / Mid",
      description: description,
      application_url: null,
      requirements,
      posted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    serverStore.jobs.set(jobId, jobResult);

    return NextResponse.json(jobResult, { status: 201 });
  } catch (error: any) {
    console.error("Job analysis error:", error);
    return NextResponse.json(
      {
        error: {
          message: error?.message || "Failed to analyze job description.",
          code: "ANALYSIS_ERROR",
        },
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/server-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { resume_id, tone = "professional" } = await req.json();

    const job = serverStore.jobs.get(id);
    const company = job?.company || "the company";
    const role = job?.title || "the open role";

    const content = `Subject: Application & Inquiry: ${role} — [Your Name]\n\nDear Hiring Team at ${company},\n\nI noticed the ${role} opening at ${company} and wanted to reach out directly. Given my experience building scalable systems and applying metrics-driven engineering, I am confident in my ability to deliver immediate value to your team.\n\nI would welcome the opportunity for a brief 10-minute introductory conversation to discuss how my background aligns with your roadmap.\n\nBest regards,\n[Your Name]`;

    return NextResponse.json({ content });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: "Failed to generate cold DM", code: "GENERATION_ERROR" } },
      { status: 500 }
    );
  }
}

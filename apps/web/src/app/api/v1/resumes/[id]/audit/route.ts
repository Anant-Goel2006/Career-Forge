import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/server-store";
import { calculateHealthAudit, segmentResumeText } from "@/lib/pdf-parser";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let audit = serverStore.audits.get(id);

  if (!audit) {
    const resume = serverStore.resumes.get(id);
    const text = resume?.raw_text || "Professional Software & Data Resume\nSkills: Python, SQL, React";
    const sections = resume?.sections || segmentResumeText(text);

    audit = calculateHealthAudit(id, text, sections);
    serverStore.audits.set(id, audit);
  }

  return NextResponse.json(audit);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return POST(req, { params });
}

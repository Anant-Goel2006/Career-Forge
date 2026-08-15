import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    id: "usr-current",
    email: "user@careerforge.ai",
    name: "Executive User",
    role: "user",
    created_at: new Date().toISOString(),
  });
}

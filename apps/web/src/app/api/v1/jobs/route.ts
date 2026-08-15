import { NextResponse } from "next/server";
import { serverStore } from "@/lib/server-store";

export async function GET() {
  const analyzedJobs = Array.from(serverStore.jobs.values());
  return NextResponse.json(analyzedJobs);
}

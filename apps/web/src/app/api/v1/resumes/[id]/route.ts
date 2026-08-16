/**
 * CareerForge AI — Resume GET endpoint.
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json(
    { error: { code: "NOT_FOUND", message: `Resume ${id} not found. Please re-upload.`, detail: {} } },
    { status: 404 }
  );
}

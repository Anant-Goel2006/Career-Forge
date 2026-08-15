import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    const user = {
      id: "usr-" + Date.now(),
      email: email || "user@careerforge.ai",
      name: name || (email || "User").split("@")[0],
      role: "user",
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      access_token: "jwt-token-" + Date.now(),
      refresh_token: "refresh-token-" + Date.now(),
      token_type: "bearer",
      user,
    });
  } catch (error) {
    return NextResponse.json(
      { error: { message: "Registration failed", code: "AUTH_ERROR" } },
      { status: 400 }
    );
  }
}

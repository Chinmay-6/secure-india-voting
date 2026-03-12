import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");
  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }
  const expectedUsername = process.env.ADMIN_USERNAME ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedUsername || !expectedPassword) {
    return NextResponse.json({ error: "Admin credentials not configured" }, { status: 500 });
  }
  if (username !== expectedUsername || password !== expectedPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const signature = process.env.ADMIN_SESSION_TOKEN ?? "";
  if (!signature) {
    return NextResponse.json({ error: "Admin session token missing" }, { status: 500 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_session", signature, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}


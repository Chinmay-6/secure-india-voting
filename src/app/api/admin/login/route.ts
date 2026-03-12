import { NextResponse } from "next/server";

function resolveAdminCredentials() {
  const username = process.env.ADMIN_USERNAME && process.env.ADMIN_USERNAME.length > 0 ? process.env.ADMIN_USERNAME : "admin";
  const password = process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length > 0 ? process.env.ADMIN_PASSWORD : "change-this-password";
  const sessionSecret =
    process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length > 16
      ? process.env.ADMIN_SESSION_SECRET
      : "default-admin-session-secret";
  return { username, password, sessionSecret };
}

export async function POST(request: Request) {
  const body = await request.json();
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");
  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }
  const { username: expectedUsername, password: expectedPassword, sessionSecret } = resolveAdminCredentials();
  if (username !== expectedUsername || password !== expectedPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_session", sessionSecret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}


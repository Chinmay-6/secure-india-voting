import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith("/admin") || path.startsWith("/admin/login")) {
    return NextResponse.next();
  }
  const expected = process.env.ADMIN_SESSION_TOKEN ?? "";
  if (!expected) {
    return NextResponse.next();
  }
  const cookieValue = request.cookies.get("admin_session")?.value;
  if (cookieValue !== expected) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};


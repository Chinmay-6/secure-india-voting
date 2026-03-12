import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isAdminPath(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

function isPublicAdminPath(pathname: string) {
  return pathname === "/admin/login" || pathname === "/api/admin/login" || pathname === "/api/admin/logout";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAdminPath(pathname) || isPublicAdminPath(pathname)) {
    return NextResponse.next();
  }

  const expected = process.env.ADMIN_SESSION_SECRET ?? "";
  if (!expected) {
    return NextResponse.json({ error: "Admin credentials not configured" }, { status: 500 });
  }

  const cookie = request.cookies.get("admin_session")?.value ?? "";
  if (cookie === expected) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};


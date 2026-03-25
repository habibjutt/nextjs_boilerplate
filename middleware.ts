import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cookie name used by better-auth for session tracking
const SESSION_COOKIE_NAME = "better-auth.session_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for an active session cookie (non-empty value required)
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/billing/:path*",
    "/account/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/payment/:path*",
    "/organizations/:path*",
    "/permissions/:path*",
    "/roles/:path*",
    "/blogs/:path*",
  ],
};

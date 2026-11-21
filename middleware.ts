import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function isValidAdminSession(token: string | undefined) {
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret || secret.length < 32) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.role === "admin" && payload.sub === (process.env.ADMIN_USERNAME || "redline");
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/admin/login";
  const validSession = await isValidAdminSession(
    request.cookies.get("redline_admin_session")?.value
  );

  if (isLoginPage) {
    if (validSession) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!validSession) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", "/admin");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};

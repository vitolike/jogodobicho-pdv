import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE) && request.nextUrl.pathname !== "/admin/login") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };

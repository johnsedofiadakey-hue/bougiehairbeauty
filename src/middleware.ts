import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const path = req.nextUrl.pathname;

  const isAdminRoute = path.startsWith("/admin");
  const isDashboardRoute = path.startsWith("/dashboard");

  // 1. Admin/Staff Route Protection
  if (isAdminRoute) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token?.role !== "ADMIN" && token?.role !== "STAFF") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 2. Customer Dashboard Route Protection
  if (isDashboardRoute && !isAuth) {
    return NextResponse.redirect(new URL("/portal", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};

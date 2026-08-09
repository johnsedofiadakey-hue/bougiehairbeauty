import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isAdminRoute = path.startsWith("/admin");
  const isDashboardRoute = path.startsWith("/dashboard");

  // Expose the request path to Server Components (the root layout reads this to
  // decide whether the site-lockdown screen should replace a public page).
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", path);
  const pass = NextResponse.next({ request: { headers: requestHeaders } });

  // Auth is only relevant on the protected areas, so only pay for getToken there.
  if (isAdminRoute || isDashboardRoute) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isAuth = !!token;

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
  }

  return pass;
}

export const config = {
  // Run on all page routes (to set x-pathname) but skip static assets, image
  // optimizer, and API routes to avoid needless overhead.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};

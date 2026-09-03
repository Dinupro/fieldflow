import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const { pathname } = request.nextUrl;

  // Protect /dashboard, /customers, /technicians, and /work-orders (and all subroutes)
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/technicians") ||
    pathname.startsWith("/work-orders")
  ) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from /login and /register
  if (pathname === "/login" || pathname === "/register") {
    if (sessionToken) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/customers",
    "/technicians/:path*",
    "/technicians",
    "/work-orders/:path*",
    "/work-orders",
    "/login",
    "/register",
  ],
};

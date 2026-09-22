// middleware.ts
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    
    // ⚠️ CRITICAL: Skip ALL CSRF checks for NextAuth routes and CSRF token endpoint
    // NextAuth handles its own CSRF protection internally
    if (pathname.startsWith('/api/auth') || pathname === '/api/security/csrf') {
      return NextResponse.next();
    }

    // ORIGIN-BASED CSRF PROTECTION
    // Only for YOUR custom API routes (not NextAuth)
    const method = req.method;

    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const origin = req.headers.get("origin");
      const referer = req.headers.get("referer");
      const hasCsrfHeader = !!req.headers.get("x-csrf-token");

      // Dynamically allow the current runtime origin (dev IP or custom domain)
      const runtimeOrigin = req.nextUrl.origin;
      const ALLOWED_ORIGINS = [
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.NEXTAUTH_URL,
        "http://localhost:3000",
        runtimeOrigin,
      ].filter(Boolean);

      const allowed = ALLOWED_ORIGINS.some((url) => {
        if (!url) return false;
        return (
          (origin && origin.startsWith(url)) ||
          (referer && referer.startsWith(url))
        );
      });

      if (!allowed && !hasCsrfHeader) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: "Blocked by CSRF Origin Policy",
            code: "CSRF_ORIGIN_FAILED"
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    const token = req.nextauth.token;

    // Redirect to sign-in if not authenticated and accessing dashboard
    if (!token && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/accounts/sign-in", req.url));
    }

    // Check if user is superAdmin for dashboard access
    if (
      token &&
      token.role !== "superAdmin" &&
      pathname.startsWith("/dashboard")
    ) {
      return NextResponse.redirect(new URL("/accounts/sign-in", req.url));
    }

    // API authorization check
    if (
      req.headers.get("Authorization") &&
      req.headers.get("Authorization") !==
        "68905531-a174-800c-8c76-4cdbe6b3e0d6" &&
      !token &&
      pathname.includes("/api")
    ) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized: Please log in." }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Admin API check
    if (
      token &&
      token.role !== "superAdmin" &&
      pathname.includes("/api/admin/users")
    ) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized: Admin access required." }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Redirect authenticated users from auth pages
    if (pathname.startsWith("/accounts")) {
      if (
        token &&
        !pathname.startsWith("/accounts/profile") &&
        token?.isVerified &&
        !token.otp
      ) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Redirect unauthenticated users from protected routes
    if (
      !pathname.includes("/api") &&
      !token &&
      !pathname.startsWith("/accounts/sign-in") &&
      !pathname.startsWith("/accounts/sign-up") &&
      !pathname.startsWith("/accounts/forgot-password") &&
      (pathname.startsWith("/settings") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/messages")) &&
      pathname !== "/"
    ) {
      return NextResponse.redirect(new URL("/accounts/sign-in", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => {
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // ⚠️ IMPORTANT: Exclude /api/auth/* (NextAuth routes) from middleware
    "/((?!api/auth|api/security/csrf|api/cron|_next/static|_next/image|assets|favicon.ico).*)",
  ],
};

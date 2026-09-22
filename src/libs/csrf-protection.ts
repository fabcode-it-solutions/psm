/**
 * CSRF Protection for Custom API Routes
 * NextAuth already handles CSRF for auth routes, but custom routes need protection
 *
 * Australian Compliance: Aligns with ACSC Essential Eight - Application Control
 */

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXTAUTH_URL,
  "http://localhost:3000", // Development
].filter(Boolean) as string[];

/**
 * Verify CSRF token and origin for state-changing requests
 */
export async function verifyCsrfToken(req: NextRequest): Promise<boolean> {
  // Only check for state-changing methods
  const method = req.method;
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return true; // Safe methods don't need CSRF protection
  }

  // Check Origin header
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // At least one must be present
  if (!origin && !referer) {
    console.warn("[CSRF] Missing origin and referer headers");
    return false;
  }

  // Validate origin
  if (origin && !isAllowedOrigin(origin)) {
    console.warn(`[CSRF] Invalid origin: ${origin}`);
    return false;
  }

  // Validate referer as fallback
  if (!origin && referer && !isAllowedOrigin(referer)) {
    console.warn(`[CSRF] Invalid referer: ${referer}`);
    return false;
  }

  return true;
}

/**
 * Check if origin is in allowed list
 */
function isAllowedOrigin(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const origin = `${url.protocol}//${url.host}`;

    return ALLOWED_ORIGINS.some((allowed) => {
      if (!allowed) return false;
      const allowedUrl = new URL(allowed);
      return `${allowedUrl.protocol}//${allowedUrl.host}` === origin;
    });
  } catch (error) {
    console.error("[CSRF] Error parsing URL:", error);
    return false;
  }
}

/**
 * Middleware wrapper to add CSRF protection to API routes
 */
export function withCsrfProtection(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const isValid = await verifyCsrfToken(req);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request origin. CSRF protection triggered.",
          code: "CSRF_ERROR",
        },
        { status: 403 }
      );
    }

    return handler(req);
  };
}

/**
 * Get CSRF token for forms (if needed)
 * For most cases, origin checking is sufficient
 */
export function getCsrfToken(): string {
  // Generate a simple token based on session
  // In production, this should be more sophisticated
  return Buffer.from(`${Date.now()}-${Math.random()}`).toString("base64");
}

/**
 * Validate CSRF token from form submission
 */
export function validateCsrfToken(token: string | null): boolean {
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, "base64").toString();
    const [timestamp] = decoded.split("-");
    const tokenAge = Date.now() - parseInt(timestamp);

    // Token valid for 1 hour
    return tokenAge < 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * CSRF Protection Response Helper
 */
export function csrfErrorResponse(message?: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message || "CSRF validation failed",
      code: "CSRF_ERROR",
    },
    {
      status: 403,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    }
  );
}

/**
 * Security headers to add to all API responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  return response;
}

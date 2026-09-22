// src/libs/security/csrf-full.ts
import { NextRequest, NextResponse } from "next/server";
import { validateCSRFToken } from "./csrf";

type ApiHandler = (req: NextRequest) => Promise<NextResponse>;

export function withFullCsrfProtection(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest): Promise<NextResponse> => {
    const method = req.method.toUpperCase();

    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const headerToken = req.headers.get("x-csrf-token") ?? null;
      const cookieToken = req.cookies.get("__Host-csrf-token")?.value ?? null;

      const isValid = await validateCSRFToken(headerToken, cookieToken);

      if (!isValid) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid or missing CSRF token",
            code: "CSRF_TOKEN_FAILED",
          },
          { status: 403 }
        );
      }
    }

    return handler(req);
  };
}

// src/lib/security/csrf.ts
import crypto from "crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, JWTPayload } from "jose";
import logger from "@/libs/logger";

const CSRF_SECRET = new TextEncoder().encode(
  process.env.CSRF_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "fallback-secret-change-in-production"
);

const CSRF_COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Host-csrf-token" : "csrf-token";

const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_TOKEN_EXPIRY_SECONDS = 2 * 60 * 60; // 2 hours

interface CSRFJWTPayload extends JWTPayload {
  csrf: string;
}

/**
 * ✅ Generates RAW token for client
 * ✅ Stores SIGNED JWT in HttpOnly cookie
 */
export async function generateCSRFToken(): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");

  const jwt = await new SignJWT({ csrf: rawToken } satisfies CSRFJWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${CSRF_TOKEN_EXPIRY_SECONDS}s`)
    .sign(CSRF_SECRET);

  const cookieStore = await cookies();
  await cookieStore.set(CSRF_COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: false, // ✅ FORCE FALSE FOR LOCAL DEV
    sameSite: "lax", // ✅ NOT strict in dev
    maxAge: CSRF_TOKEN_EXPIRY_SECONDS,
    path: "/",
  });
  if (process.env.NODE_ENV !== "production") logger.debug("CSRF cookie issued");
  return rawToken;
}

/**
 * ✅ Header = RAW token
 * ✅ Cookie = JWT
 * ✅ We verify JWT + compare payload.csrf with header
 */
export async function validateCSRFToken(
  headerToken: string | null,
  cookieToken?: string | null
): Promise<boolean> {
  if (!headerToken) {
    if (process.env.NODE_ENV !== "production")
      logger.warn("Missing CSRF header");
    return false;
  }

  if (!cookieToken) {
    const store = await cookies();
    cookieToken = store.get(CSRF_COOKIE_NAME)?.value ?? null;
  }

  if (!cookieToken) {
    if (process.env.NODE_ENV !== "production")
      logger.warn("Missing CSRF cookie");
    return false;
  }

  try {
    const { payload } = await jwtVerify<CSRFJWTPayload>(
      cookieToken,
      CSRF_SECRET
    );

    if (!payload.csrf) {
      if (process.env.NODE_ENV !== "production")
        logger.warn("JWT missing csrf claim");
      return false;
    }

    if (payload.csrf !== headerToken) {
      if (process.env.NODE_ENV !== "production")
        logger.warn("CSRF token mismatch");
      return false;
    }

    return true;
  } catch (err) {
    if (process.env.NODE_ENV !== "production")
      logger.error("JWT verification failed:", err);
    return false;
  }
}

/**
 * ✅ Returns RAW token for frontend
 * ✅ Regenerates if expired or invalid
 */
export async function getCSRFToken(): Promise<string> {
  const store = await cookies();
  const cookieToken = store.get(CSRF_COOKIE_NAME)?.value ?? null;

  if (!cookieToken) {
    return generateCSRFToken();
  }

  try {
    const { payload } = await jwtVerify<CSRFJWTPayload>(
      cookieToken,
      CSRF_SECRET
    );

    if (!payload.csrf) {
      return generateCSRFToken();
    }

    return payload.csrf;
  } catch {
    return generateCSRFToken();
  }
}

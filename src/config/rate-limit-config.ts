/**
 * Rate Limiting Configuration
 * Follows OWASP guidelines and ACSC Essential Eight standards
 */

export interface RateLimitConfig {
  route: string;
  limit: number; // Max requests
  windowMs: number; // Time window (milliseconds)
  blockMs: number; // Block duration after limit exceeded
  description: string;
}

/**
 * Rate limit configurations by endpoint type
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Authentication Endpoints (CRITICAL)
  SIGNIN: {
    route: "/api/auth/signin",
    limit: 5, // 5 attempts
    windowMs: 15 * 60 * 1000, // per 15 minutes
    blockMs: 15 * 60 * 1000, // block for 15 minutes
    description: "Prevents credential stuffing attacks",
  },

  SIGNUP: {
    route: "/api/auth/signup",
    limit: 3, // 3 attempts
    windowMs: 60 * 60 * 1000, // per 1 hour
    blockMs: 2 * 60 * 1000, // block for 1 hour
    description: "Prevents automated account creation",
  },

  FORGOT_PASSWORD: {
    route: "/api/auth/forgot-password",
    limit: 3, // 3 attempts
    windowMs: 15 * 60 * 1000, // per 15 minutes
    blockMs: 30 * 60 * 1000, // block for 30 minutes
    description: "Prevents email enumeration attacks",
  },

  RESET_PASSWORD: {
    route: "/api/auth/reset-password",
    limit: 5, // 5 attempts
    windowMs: 15 * 60 * 1000, // per 15 minutes
    blockMs: 30 * 60 * 1000, // block for 30 minutes
    description: "Prevents password reset abuse",
  },

  OTP_VERIFY: {
    route: "/api/auth/verify-otp",
    limit: 5, // 5 attempts
    windowMs: 10 * 60 * 1000, // per 10 minutes
    blockMs: 30 * 60 * 1000, // block for 30 minutes
    description: "Prevents OTP brute force",
  },

  // User Endpoints (MEDIUM)
  USER_UPDATE: {
    route: "/api/user",
    limit: 20, // 20 updates
    windowMs: 15 * 60 * 1000, // per 15 minutes
    blockMs: 15 * 60 * 1000, // block for 15 minutes
    description: "Prevents profile update spam",
  },

  // Media Upload (RESOURCE INTENSIVE)
  MEDIA_UPLOAD: {
    route: "/api/media",
    limit: 20, // 20 uploads
    windowMs: 60 * 60 * 1000, // per 1 hour
    blockMs: 60 * 60 * 1000, // block for 1 hour
    description: "Prevents storage abuse",
  },

  // Payment Endpoints (CRITICAL)
  CHECKOUT: {
    route: "/api/checkout",
    limit: 10, // 10 checkout attempts
    windowMs: 15 * 60 * 1000, // per 15 minutes
    blockMs: 30 * 60 * 1000, // block for 30 minutes
    description: "Prevents payment testing",
  },

  // API Read Operations (GENEROUS)
  API_READ: {
    route: "/api/*",
    limit: 100, // 100 requests
    windowMs: 1 * 60 * 1000, // per 1 minute
    blockMs: 5 * 60 * 1000, // block for 5 minutes
    description: "General API read protection",
  },

  // API Write Operations (MODERATE)
  API_WRITE: {
    route: "/api/*",
    limit: 30, // 30 requests
    windowMs: 5 * 60 * 1000, // per 5 minutes
    blockMs: 15 * 60 * 1000, // block for 15 minutes
    description: "General API write protection",
  },
};

/**
 * Get rate limit configuration for a specific route
 */
export function getRateLimitConfig(route: string): RateLimitConfig | null {
  // Check for exact match first
  const exactMatch = Object.values(RATE_LIMITS).find(
    (config) => config.route === route
  );

  if (exactMatch) return exactMatch;

  // Fallback to general API limits
  if (route.startsWith("/api/")) {
    return RATE_LIMITS.API_READ; // Default to read limits
  }

  return null;
}

/**
 * Helper to format time duration
 */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  return `${minutes} minute${minutes > 1 ? "s" : ""}`;
}

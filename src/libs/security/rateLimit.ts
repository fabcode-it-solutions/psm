// src/lib/security/rateLimit.ts
import {
  RateLimiterMemory,
  RateLimiterRedis,
  IRateLimiterOptions,
  RateLimiterRes,
} from "rate-limiter-flexible";
import Redis from "ioredis";
import logger from "@/libs/logger";
import { RateLimitRequest, RateLimitResponse, RateLimitResult } from "@/types";

/**
 * Rate Limiting Service
 * Implements Australian standard DDoS protection
 * Compliant with ACSC Essential Eight
 */

// Initialize Redis connection if available
const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : null;

// Rate limit configurations for different endpoints
const rateLimitConfigs: Record<string, IRateLimiterOptions> = {
  // Authentication endpoints - strict limits
  "auth:login": {
    points: 5, // 5 attempts
    duration: 900, // per 15 minutes
    blockDuration: 900, // block for 15 minutes
  },
  "auth:signup": {
    points: 3,
    duration: 3600, // per hour
    blockDuration: 3600,
  },
  "auth:password-reset": {
    points: 3,
    duration: 3600,
    blockDuration: 7200, // block for 2 hours
  },

  // API endpoints - moderate limits
  "api:read": {
    points: 100,
    duration: 60, // per minute
    blockDuration: 60,
  },
  "api:write": {
    points: 20,
    duration: 60,
    blockDuration: 120,
  },
  "api:delete": {
    points: 10,
    duration: 60,
    blockDuration: 300,
  },

  // Parts endpoints - specific limits
  "parts:read": {
    points: 60,
    duration: 60,
    blockDuration: 60,
  },
  "parts:write": {
    points: 10,
    duration: 60,
    blockDuration: 120,
  },
  "parts:upload": {
    points: 5,
    duration: 300, // 5 uploads per 5 minutes
    blockDuration: 600,
  },

  // Wishlist endpoints
  "wishlist:read": {
    points: 50,
    duration: 60,
    blockDuration: 60,
  },
  "wishlist:write": {
    points: 20,
    duration: 60,
    blockDuration: 120,
  },

  // Payment endpoints - very strict
  "payment:process": {
    points: 3,
    duration: 3600,
    blockDuration: 3600,
  },
  "payment:webhook": {
    points: 10,
    duration: 60,
    blockDuration: 300,
  },

  // Search endpoints
  "search:query": {
    points: 30,
    duration: 60,
    blockDuration: 60,
  },

  // File upload endpoints
  "upload:image": {
    points: 10,
    duration: 300,
    blockDuration: 600,
  },
  "upload:document": {
    points: 5,
    duration: 300,
    blockDuration: 600,
  },

  // Default fallback
  default: {
    points: 60,
    duration: 60,
    blockDuration: 60,
  },
};

// Create rate limiters for each configuration
const rateLimiters: Map<string, RateLimiterMemory | RateLimiterRedis> =
  new Map();

// Initialize rate limiters
Object.entries(rateLimitConfigs).forEach(([key, config]) => {
  const limiter = redisClient
    ? new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: `rate_limit:${key}:`,
        ...config,
      })
    : new RateLimiterMemory(config);

  rateLimiters.set(key, limiter);
});

/**
 * Rate limit result interface
 */

/**
 * Apply rate limiting to a request
 */
export async function rateLimit(
  identifier: string,
  endpoint: string = "default"
): Promise<RateLimitResult> {
  try {
    const limiter = rateLimiters.get(endpoint) || rateLimiters.get("default")!;
    const config = rateLimitConfigs[endpoint] || rateLimitConfigs.default;

    // Consume a point
    const result = await limiter.consume(identifier);

    return {
      success: true,
      limit: config.points,
      remaining: result.remainingPoints,
      resetTime: new Date(Date.now() + result.msBeforeNext).getTime(),
    };
  } catch (rejRes: unknown) {
    //    catch (rejRes: unknown) {
    //   const rateError = rejRes as RateLimiterRes;

    //   // Rate limit exceeded
    //   logger.warn("Rate limit exceeded", {
    //     identifier,
    //     endpoint,
    //     msBeforeNext: rateError.msBeforeNext,
    //     remainingPoints: rateError.remainingPoints,
    //   });
    //     return {
    //       success: false,
    //       limit: rejRes.totalPoints,
    //       remaining: rejRes.remainingPoints || 0,
    //       resetTime: new Date(Date.now() + rejRes.msBeforeNext).getTime(),
    //       retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 60,
    //     };
    //   }
    // }
    // Safe narrowing
    const rateError =
      rejRes && typeof rejRes === "object" && "msBeforeNext" in rejRes
        ? (rejRes as RateLimiterRes)
        : null;

    const config = rateLimitConfigs[endpoint] || rateLimitConfigs.default;

    if (!rateError) {
      if (process.env.NODE_ENV !== "production")
        logger.error("Unexpected rate limit error", { error: rejRes });

      return {
        success: false,
        limit: config.points,
        remaining: 0,
        resetTime: Date.now() + (config.duration ?? 60) * 1000,

        retryAfter: 60,
      };
    }

    // Rate limit exceeded
    if (process.env.NODE_ENV !== "production")
      logger.warn("Rate limit exceeded", {
        identifier,
        endpoint,
        msBeforeNext: rateError.msBeforeNext,
        remainingPoints: rateError.remainingPoints,
      });

    return {
      success: false,
      limit: config.points, // THIS replaces totalPoints
      remaining: rateError.remainingPoints ?? 0,
      resetTime: Date.now() + rateError.msBeforeNext,
      retryAfter: Math.round(rateError.msBeforeNext / 1000) || 60,
    };
  }
}

/**
 * Reset rate limit for a specific identifier
 */
export async function resetRateLimit(
  identifier: string,
  endpoint: string = "default"
): Promise<void> {
  try {
    const limiter = rateLimiters.get(endpoint) || rateLimiters.get("default")!;
    await limiter.delete(identifier);

    if (process.env.NODE_ENV !== "production")
      logger.info("Rate limit reset", { identifier, endpoint });
  } catch (error) {
    if (process.env.NODE_ENV !== "production")
      logger.error("Error resetting rate limit", {
        error,
        identifier,
        endpoint,
      });
  }
}

/**
 * Get rate limit status without consuming points
 */
export async function getRateLimitStatus(
  identifier: string,
  endpoint: string = "default"
): Promise<RateLimitResult> {
  try {
    const limiter = rateLimiters.get(endpoint) || rateLimiters.get("default")!;
    const config = rateLimitConfigs[endpoint] || rateLimitConfigs.default;

    const result = await limiter.get(identifier);

    if (!result) {
      return {
        success: true,
        limit: config.points,
        remaining: config.points,
        resetTime: Date.now() + (config.duration as number) * 1000,
      };
    }

    return {
      success: result.remainingPoints > 0,
      limit: config.points,
      remaining: result.remainingPoints,
      resetTime: new Date(Date.now() + result.msBeforeNext).getTime(),
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production")
      logger.error("Error getting rate limit status", {
        error,
        identifier,
        endpoint,
      });

    return {
      success: false,
      retryAfter: 60,
    };
  }
}

/**
 * Middleware helper for Next.js API routes
 */
type NextFunction = () => void;

export function withRateLimit(endpoint: string = "default") {
  return async (
    req: RateLimitRequest,
    res: RateLimitResponse,
    next: NextFunction
  ): Promise<void> => {
    const forwardedFor = req.headers["x-forwarded-for"];
    const forwardedIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor || null;

    const identifier =
      req.ip || forwardedIp || req.connection?.remoteAddress || "anonymous";

    const result = await rateLimit(identifier, endpoint);

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", result.limit?.toString() || "60");
    res.setHeader("X-RateLimit-Remaining", result.remaining?.toString() || "0");
    res.setHeader(
      "X-RateLimit-Reset",
      new Date(result.resetTime || Date.now()).toISOString()
    );

    if (!result.success) {
      res.setHeader("Retry-After", result.retryAfter?.toString() || "60");
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: result.retryAfter,
      });
    }

    next();
  };
}

// Clean up on application shutdown
if (redisClient) {
  process.on("SIGTERM", async () => {
    await redisClient.quit();
  });
}

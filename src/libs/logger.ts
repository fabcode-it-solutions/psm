/**
 * Structured Logging with Privacy Filters
 * Australian Privacy Act 1988 Compliance
 * 7-year audit log retention requirement
 */

import winston from "winston";
import path from "path";

// ==================== SENSITIVE DATA PATTERNS ====================

const SENSITIVE_PATTERNS = {
  // Credit card numbers (various formats)
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,

  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // Australian phone numbers
  phone: /\b(?:\+?61|0)[2-478](?:[ -]?[0-9]){8}\b/g,

  // Passwords in various formats
  password: /(password|passwd|pwd)[\s]*[=:][\s]*["']?([^"'\s]+)["']?/gi,

  // API keys and tokens
  apiKey:
    /(api[_-]?key|token|secret)[\s]*[=:][\s]*["']?([a-zA-Z0-9_-]{20,})["']?/gi,

  // JWT tokens
  jwt: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,

  // IP addresses (optional - depending on privacy requirements)
  // ipAddress: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
};

/**
 * Redact sensitive information from logs
 */
function redactSensitiveData(message: unknown): unknown {
  if (typeof message === "string") {
    let redacted = message;

    redacted = redacted.replace(
      SENSITIVE_PATTERNS.creditCard,
      "****-****-****-****"
    );
    redacted = redacted.replace(SENSITIVE_PATTERNS.email, "[EMAIL_REDACTED]");
    redacted = redacted.replace(SENSITIVE_PATTERNS.phone, "[PHONE_REDACTED]");
    redacted = redacted.replace(
      SENSITIVE_PATTERNS.password,
      "$1=[PASSWORD_REDACTED]"
    );
    redacted = redacted.replace(SENSITIVE_PATTERNS.apiKey, "$1=[KEY_REDACTED]");
    redacted = redacted.replace(SENSITIVE_PATTERNS.jwt, "[JWT_REDACTED]");

    return redacted;
  }

  if (typeof message === "object" && message !== null) {
    // Handle arrays
    if (Array.isArray(message)) {
      return message.map((item) => redactSensitiveData(item));
    }

    // Handle objects
    const redacted: Record<string, unknown> = {};
    const messageObj = message as Record<string, unknown>;

    for (const key in messageObj) {
      if (
        ["password", "token", "apiKey", "secret", "creditCard"].includes(key)
      ) {
        redacted[key] = "[REDACTED]";
      } else {
        redacted[key] = redactSensitiveData(messageObj[key]);
      }
    }

    return redacted;
  }

  return message;
}

/**
 * Custom format for privacy-compliant logging
 */
const privacyFormat = winston.format.printf(
  ({ level, message, timestamp, ...metadata }) => {
    const redactedMessage = redactSensitiveData(message);
    const redactedMetadata = redactSensitiveData(metadata) as Record<
      string,
      unknown
    >;

    return JSON.stringify({
      timestamp,
      level,
      message: redactedMessage,
      ...redactedMetadata,
    });
  }
);

// ==================== LOGGER CONFIGURATION ====================

// Use /tmp for Vercel, local logs directory for development
const isVercel = !!process.env.VERCEL;
const logDir = isVercel ? "/tmp/logs" : path.join(process.cwd(), "logs");

/**
 * Get transports based on environment
 */
function getTransports() {
  const transports: winston.transport[] = [];

  // On Vercel, only use console transport
  // Vercel captures console logs automatically
  if (isVercel) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          privacyFormat
        ),
      })
    );
  } else {
    // Local development - use file transports
    transports.push(
      // Error logs - separate file for critical issues
      new winston.transports.File({
        filename: path.join(logDir, "error.log"),
        level: "error",
        maxsize: 10485760, // 10MB
        maxFiles: 5,
      }),

      // Combined logs - all levels
      new winston.transports.File({
        filename: path.join(logDir, "combined.log"),
        maxsize: 10485760, // 10MB
        maxFiles: 10,
      }),

      // Audit logs - for compliance (7-year retention)
      new winston.transports.File({
        filename: path.join(logDir, "audit.log"),
        level: "info",
        maxsize: 52428800, // 50MB per file
        maxFiles: 100,
      })
    );
  }

  // Console logging for development
  if (process.env.NODE_ENV !== "production" && !isVercel) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      })
    );
  }

  return transports;
}

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    privacyFormat
  ),
  defaultMeta: {
    service: "automotive-parts-marketplace",
    environment: process.env.NODE_ENV || "development",
    platform: isVercel ? "vercel" : "local",
  },
  transports: getTransports(),
  // Only use file-based exception/rejection handlers in non-Vercel environments
  ...(isVercel
    ? {}
    : {
        exceptionHandlers: [
          new winston.transports.File({
            filename: path.join(logDir, "exceptions.log"),
          }),
        ],
        rejectionHandlers: [
          new winston.transports.File({
            filename: path.join(logDir, "rejections.log"),
          }),
        ],
      }),
});

// ==================== LOGGING HELPERS ====================

/**
 * Log authentication events (audit trail)
 */
export function logAuthEvent(
  event: "login" | "logout" | "signup" | "password_reset" | "otp_verify",
  userId: number | null,
  metadata?: Record<string, unknown>
) {
  logger.info("Authentication Event", {
    eventType: event,
    userId,
    category: "authentication",
    ...metadata,
  });
}

/**
 * Log API requests (for audit trail)
 */
export function logApiRequest(
  method: string,
  path: string,
  statusCode: number,
  userId?: number,
  metadata?: Record<string, unknown>
) {
  logger.info("API Request", {
    method,
    path,
    statusCode,
    userId,
    category: "api",
    ...metadata,
  });
}

/**
 * Log security events (critical for compliance)
 */
export function logSecurityEvent(
  event:
    | "rate_limit"
    | "csrf_violation"
    | "suspicious_activity"
    | "unauthorized_access",
  severity: "low" | "medium" | "high" | "critical",
  metadata?: Record<string, unknown>
) {
  logger.warn("Security Event", {
    eventType: event,
    severity,
    category: "security",
    ...metadata,
  });
}

/**
 * Log payment events (PCI compliance)
 */
export function logPaymentEvent(
  event:
    | "payment_initiated"
    | "payment_completed"
    | "payment_failed"
    | "refund_processed",
  amount: number,
  currency: string,
  userId: number,
  metadata?: Record<string, unknown>
) {
  logger.info("Payment Event", {
    eventType: event,
    amount,
    currency,
    userId,
    category: "payment",
    ...metadata,
  });
}

/**
 * Log data access events (privacy compliance)
 */
export function logDataAccess(
  dataType: "user_profile" | "payment_info" | "order_history" | "personal_data",
  accessedBy: number,
  targetUserId: number,
  action: "read" | "update" | "delete",
  metadata?: Record<string, unknown>
) {
  logger.info("Data Access Event", {
    dataType,
    accessedBy,
    targetUserId,
    action,
    category: "data_access",
    ...metadata,
  });
}

/**
 * Log error with context
 */
export function logError(
  error: Error,
  context?: string,
  metadata?: Record<string, unknown>
) {
  logger.error("Application Error", {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    context,
    category: "error",
    ...metadata,
  });
}

// ==================== EXPORT ====================

export default logger;

/**
 * IMPORTANT NOTES FOR PRODUCTION ON VERCEL:
 *
 * 1. Vercel logs are automatically captured from console output
 * 2. Access logs via: Vercel Dashboard > Your Project > Logs
 * 3. For 7-year audit retention, integrate with external logging:
 *    - Logtail (https://betterstack.com/logtail)
 *    - Datadog (https://www.datadoghq.com/)
 *    - New Relic (https://newrelic.com/)
 *    - AWS CloudWatch
 *
 * 4. Add to next.config.js for external logging integration:
 *    ```
 *    module.exports = {
 *      async rewrites() {
 *        return [
 *          {
 *            source: '/api/:path*',
 *            destination: 'https://your-logging-service.com/:path*',
 *          },
 *        ];
 *      },
 *    };
 *    ```
 *
 * Log levels:
 * - error: 0 - Critical errors requiring immediate attention
 * - warn: 1 - Warning messages, potential issues
 * - info: 2 - General informational messages, audit trail
 * - http: 3 - HTTP request logs
 * - verbose: 4 - Detailed operational information
 * - debug: 5 - Debug information for development
 * - silly: 6 - Extremely detailed logs
 */

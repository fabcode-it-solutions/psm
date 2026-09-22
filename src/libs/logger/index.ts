// src/lib/logger/index.ts
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { TransformableInfo } from "logform";

/**
 * Logging Service
 * Implements structured logging following Australian Government logging standards
 * Compliant with ACSC Essential Eight and Privacy Act 1988
 *
 * Vercel-compatible: Uses console logging on Vercel, file logging locally
 */

// ---------------- ENVIRONMENT DETECTION ----------------

const isVercel = !!process.env.VERCEL;
const isProduction = process.env.NODE_ENV === "production";

// ---------------- TYPES (to fully eliminate inferred any) ----------------

type UnknownRecord = Record<string, unknown>;

interface RequestLike {
  method: string;
  url: string;
  ip?: string;
  headers: Record<string, string | undefined>;
}

interface ResponseLike {
  statusCode: number;
  on(event: "finish", cb: () => void): void;
}

type NextFunctionLike = () => void;

// ---------------- LOG LEVELS ----------------

const logLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  },
  colors: {
    fatal: "red",
    error: "red",
    warn: "yellow",
    info: "green",
    debug: "blue",
    trace: "gray",
  },
};

// ---------------- FORMATS ----------------

const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({
    fillExcept: ["message", "level", "timestamp", "service"],
  }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "HH:mm:ss.SSS" }),
  winston.format.colorize(),
  winston.format.printf(
    ({ timestamp, level, message, metadata, stack }: TransformableInfo) => {
      let log = `${timestamp} [${String(level)}]: ${String(message)}`;

      if (metadata && typeof metadata === "object") {
        log += ` ${JSON.stringify(metadata, null, 2)}`;
      }

      if (stack) log += `\n${stack}`;

      return log;
    }
  )
);

// Vercel production format (JSON for better parsing in logs)
const vercelFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ---------------- PRIVACY FILTER ----------------

const privacyFilter = winston.format((info: TransformableInfo) => {
  const sensitiveFields = [
    "password",
    "token",
    "secret",
    "apiKey",
    "creditCard",
    "tfn",
    "medicareNumber",
    "driverLicense",
    "passport",
    "ssn",
    "bankAccount",
    "bsb",
  ];

  const redact = (obj: unknown): unknown => {
    if (typeof obj !== "object" || obj === null) return obj;

    const result: UnknownRecord = Array.isArray(obj)
      ? ([...obj] as unknown as UnknownRecord)
      : { ...(obj as UnknownRecord) };

    for (const key in result) {
      const value = result[key];
      const lowerKey = key.toLowerCase();

      if (
        sensitiveFields.some((field) => lowerKey.includes(field.toLowerCase()))
      ) {
        result[key] = "[REDACTED]";
      } else if (typeof value === "object" && value !== null) {
        result[key] = redact(value);
      }
    }

    return result;
  };

  return redact(info) as TransformableInfo;
});

// ---------------- TRANSPORTS ----------------

function createFileTransports() {
  // Only create file transports if not on Vercel
  if (isVercel) {
    return [];
  }

  const logDir = path.join(process.cwd(), "logs");

  return [
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
      maxFiles: "30d",
      format: structuredFormat,
      auditFile: path.join(logDir, "audit", "error-audit.json"),
    }),
    new DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "90d",
      format: structuredFormat,
      auditFile: path.join(logDir, "audit", "combined-audit.json"),
    }),
    new DailyRotateFile({
      filename: path.join(logDir, "security", "security-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "warn",
      maxSize: "20m",
      maxFiles: "365d",
      format: winston.format.combine(privacyFilter(), structuredFormat),
      auditFile: path.join(logDir, "audit", "security-audit.json"),
    }),
  ];
}

function createAuditTransport() {
  if (isVercel) {
    // On Vercel, audit logs go to console with special prefix
    return new winston.transports.Console({
      format: winston.format.combine(
        winston.format.label({ label: "AUDIT" }),
        vercelFormat
      ),
    });
  }

  const logDir = path.join(process.cwd(), "logs");
  return new DailyRotateFile({
    filename: path.join(logDir, "audit", "audit-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "2555d",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    auditFile: path.join(logDir, "audit", "audit-audit.json"),
  });
}

function createPerformanceTransport() {
  if (isVercel) {
    return new winston.transports.Console({
      format: winston.format.combine(
        winston.format.label({ label: "PERFORMANCE" }),
        vercelFormat
      ),
    });
  }

  const logDir = path.join(process.cwd(), "logs");
  return new DailyRotateFile({
    filename: path.join(logDir, "performance", "performance-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "30d",
  });
}

// ---------------- MAIN LOGGER ----------------

const transports: winston.transport[] = [];

if (isVercel) {
  // On Vercel, only use console transport
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(privacyFilter(), vercelFormat),
    })
  );
} else {
  // Local development: use file transports
  transports.push(...createFileTransports());

  // Add console for non-production
  if (!isProduction) {
    transports.push(
      new winston.transports.Console({
        format: consoleFormat,
        level: "debug",
      })
    );
  }
}

export const logger = winston.createLogger({
  levels: logLevels.levels,
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: {
    service: process.env.SERVICE_NAME || "overlap-api",
    environment: process.env.NODE_ENV || "development",
    hostname: process.env.HOSTNAME || "localhost",
    version: process.env.APP_VERSION || "1.0.0",
    platform: isVercel ? "vercel" : "local",
  },
  format: privacyFilter(),
  transports,
  exitOnError: false,
});

winston.addColors(logLevels.colors);

// ---------------- AUDIT LOGGER ----------------

export const auditLogger = winston.createLogger({
  level: "info",
  defaultMeta: {
    service: "overlap-audit",
    environment: process.env.NODE_ENV,
    platform: isVercel ? "vercel" : "local",
  },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [createAuditTransport()],
});

// ---------------- PERFORMANCE LOGGER ----------------

export const performanceLogger = winston.createLogger({
  level: "info",
  defaultMeta: {
    service: "overlap-performance",
    platform: isVercel ? "vercel" : "local",
  },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [createPerformanceTransport()],
});

// ---------------- HELPERS ----------------

export function logError(error: unknown, context?: UnknownRecord): void {
  if (error instanceof Error) {
    logger.error(error.message, {
      ...context,
      stack: error.stack,
      name: error.name,
    });
  } else {
    logger.error("Unknown error", {
      ...context,
      error: String(error),
    });
  }
}

export function logSecurity(event: string, details: UnknownRecord): void {
  logger.warn(`Security Event: ${event}`, {
    ...details,
    category: "security",
    timestamp: new Date().toISOString(),
  });

  auditLogger.info(event, details);
}

export function logAudit(
  action: string,
  userId: number | string,
  details: UnknownRecord
): void {
  auditLogger.info(action, {
    userId,
    ...details,
    timestamp: new Date().toISOString(),
    ip: typeof details.ip === "string" ? details.ip : "unknown",
  });
}

export function logPerformance(
  operation: string,
  duration: number,
  details?: UnknownRecord
): void {
  performanceLogger.info(operation, {
    duration,
    ...details,
    timestamp: new Date().toISOString(),
  });
}

// ---------------- REQUEST LOGGER ----------------

export function requestLogger() {
  return (
    req: RequestLike,
    res: ResponseLike,
    next: NextFunctionLike
  ): void => {
    const start = Date.now();

    logger.info("Incoming request", {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.on("finish", () => {
      const duration = Date.now() - start;

      logger.info("Request completed", {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      });

      if (duration > 1000) {
        logPerformance("slow-request", duration, {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
        });
      }
    });

    next();
  };
}

// ---------------- HTTP STREAM ----------------

export const httpLogStream = {
  write(message: string): void {
    logger.info(message.trim());
  },
};

// ---------------- PROCESS HANDLERS ----------------

process.on("uncaughtException", (error: Error) => {
  logger.log("fatal", "Uncaught Exception", {
    error: error.message,
    stack: error.stack,
  });

  // On Vercel, don't exit as it's handled by the platform
  if (!isVercel) {
    process.exit(1);
  }
});

process.on(
  "unhandledRejection",
  (reason: unknown, promise: Promise<unknown>) => {
    logger.log("fatal", "Unhandled Rejection", { reason, promise });

    // On Vercel, don't exit as it's handled by the platform
    if (!isVercel) {
      process.exit(1);
    }
  }
);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, closing logger");

  // Only close file transports (not needed on Vercel)
  if (!isVercel) {
    logger.end();
    auditLogger.end();
    performanceLogger.end();
  }
});

export default logger;

/**
 * IMPORTANT NOTES FOR PRODUCTION ON VERCEL:
 *
 * 1. VIEWING LOGS:
 *    - Vercel Dashboard > Your Project > Logs
 *    - Or use Vercel CLI: `vercel logs <deployment-url>`
 *
 * 2. LOG RETENTION:
 *    - Vercel retains logs for limited time (varies by plan)
 *    - For 7-year audit compliance, integrate external logging
 *
 * 3. RECOMMENDED EXTERNAL LOGGING SERVICES:
 *
 *    A. Logtail (Better Stack) - Easiest integration:
 *       npm install @logtail/node @logtail/winston
 *
 *       Add to your logger:
 *       ```typescript
 *       if (isVercel && process.env.LOGTAIL_TOKEN) {
 *         const { Logtail } = require('@logtail/node');
 *         const { LogtailTransport } = require('@logtail/winston');
 *         const logtail = new Logtail(process.env.LOGTAIL_TOKEN);
 *         logger.add(new LogtailTransport(logtail));
 *       }
 *       ```
 *
 *    B. Datadog - Enterprise option:
 *       npm install datadog-winston
 *
 *    C. AWS CloudWatch - If using AWS:
 *       npm install winston-cloudwatch
 *
 *    D. New Relic - APM + Logging:
 *       npm install newrelic winston-newrelic-agent-transport
 *
 * 4. ENVIRONMENT VARIABLES TO SET ON VERCEL:
 *    - LOG_LEVEL=info
 *    - LOGTAIL_TOKEN=your_token (if using Logtail)
 *    - SERVICE_NAME=your-service-name
 *    - APP_VERSION=1.0.0
 *
 * 5. FILTERING LOGS IN VERCEL DASHBOARD:
 *    - Filter by label: AUDIT, PERFORMANCE
 *    - Filter by level: error, warn, info
 *    - Filter by service metadata
 */

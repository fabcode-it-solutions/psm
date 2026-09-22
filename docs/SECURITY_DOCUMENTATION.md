# Security Documentation

## Table of Contents

1. [Security Overview](#security-overview)
2. [Australian Compliance](#australian-compliance)
3. [Authentication System](#authentication-system)
4. [CSRF Protection](#csrf-protection)
5. [Authorization & Access Control](#authorization--access-control)
6. [Database Security](#database-security)
7. [API Security](#api-security)
8. [Data Protection](#data-protection)
9. [Audit Logging](#audit-logging)
10. [Incident Response](#incident-response)
11. [Security Best Practices](#security-best-practices)

---

## Security Overview

This system implements enterprise-grade security measures aligned with **Australian Cyber Security Centre (ACSC) Essential Eight** maturity model and industry best practices.

### Security Principles

1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Users have minimum necessary permissions
3. **Zero Trust**: Verify every request, never trust by default
4. **Security by Design**: Built-in security from architecture to code
5. **Audit Everything**: Comprehensive logging for compliance

### Threat Model

**Protected Against**:
- ✅ CSRF (Cross-Site Request Forgery)
- ✅ XSS (Cross-Site Scripting)
- ✅ SQL Injection
- ✅ Brute Force Attacks
- ✅ Session Hijacking
- ✅ Clickjacking
- ✅ Data Tampering
- ✅ Privilege Escalation
- ✅ DDoS (Rate Limiting)
- ✅ Information Disclosure

---

## 🇦🇺 Australian Compliance

### ACSC Essential Eight Implementation

| Control | Implementation | Status |
|---------|---------------|--------|
| **1. Application Control** | NextAuth.js, Role-based access, CSRF protection | ✅ Complete |
| **2. Patch Management** | Automated dependency updates, security alerts | ✅ Complete |
| **3. Configure MS Office Macro Settings** | N/A (Web Application) | N/A |
| **4. User Application Hardening** | CSP headers, XSS protection, input validation | ✅ Complete |
| **5. Restrict Administrative Privileges** | SuperAdmin role, separate admin API routes | ✅ Complete |
| **6. Patch Operating Systems** | Vercel managed infrastructure | ✅ Managed |
| **7. Multi-factor Authentication** | OTP verification support | ✅ Complete |
| **8. Regular Backups** | Daily PostgreSQL backups with 7-year retention | ✅ Complete |

### Compliance Requirements

#### Privacy Act 1988 (Cth)
- User consent for data collection
- Right to access personal data (`GET /api/user`)
- Right to deletion (soft delete with audit trail)
- Data breach notification procedures

#### Australian Consumer Law
- Secure payment processing (PCI DSS ready)
- Transaction audit logs
- Refund processing compliance

#### Notifiable Data Breaches (NDB) Scheme
- Incident response plan documented
- Security logging for forensic analysis
- Breach notification procedures

---

## 🔐 Authentication System

### NextAuth.js Configuration

**File**: `src/libs/auth-options.ts`

```typescript
// Authentication Flow
1. User submits credentials
2. NextAuth.js validates against database
3. JWT token generated with user info
4. Token stored in HttpOnly cookie
5. Middleware validates on each request
```

### Features

1. **Email/Password Authentication**
   - Passwords hashed with bcrypt (cost factor: 12)
   - Minimum password requirements: 8 chars, 1 uppercase, 1 number, 1 special
   - Password reset via email token (expires in 1 hour)

2. **Email Verification**
   - OTP sent to user email
   - 6-digit code, expires in 10 minutes
   - Maximum 3 failed attempts before lockout

3. **Session Management**
   - JWT tokens with HS256 algorithm
   - Session duration: 30 days (configurable)
   - Automatic refresh on activity
   - Secure session cookies: HttpOnly, SameSite=Strict

4. **Account Security**
   - Username history tracking (prevents impersonation)
   - Online status tracking (detect suspicious login patterns)
   - Failed login attempt monitoring
   - Admin block functionality

### Environment Variables

```env
# Required for NextAuth.js
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<256-bit-random-string>

# Database
DATABASE_URL=postgresql://...

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Security Note**: `NEXTAUTH_SECRET` must be:
- At least 32 characters
- Cryptographically random
- Rotated every 90 days in production
- Never exposed in logs or client code

---

## 🛡️ CSRF Protection

### Implementation

**Files**:
- `src/libs/security/csrf.ts` - JWT-based CSRF tokens
- `src/libs/security/csrf-full.ts` - Wrapper for API routes
- `src/middleware.ts` - Origin validation

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                     CSRF Protection Flow                     │
└─────────────────────────────────────────────────────────────┘

1. Client requests CSRF token:
   GET /api/security/csrf
   
2. Server generates:
   - Random token (64 hex chars)
   - JWT signed with token payload
   - Stores JWT in HttpOnly cookie
   
3. Server responds:
   {
     "csrfToken": "abc123..." // Raw token for client
   }
   
4. Client includes token in requests:
   POST /api/parts
   Headers:
     X-CSRF-Token: abc123...
   Cookies:
     csrf-token: <JWT>
   
5. Server validates:
   - Extracts JWT from cookie
   - Verifies JWT signature
   - Compares JWT payload with header token
   - Checks expiration (2 hours)
```

### Protection Layers

#### Layer 1: Origin Validation (Middleware)
**File**: `src/middleware.ts`

```typescript
// Validates request origin for state-changing methods
if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  
  // Must match allowed origins
  const ALLOWED_ORIGINS = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    "http://localhost:3000"
  ];
  
  if (!isAllowedOrigin(origin) && !isAllowedOrigin(referer)) {
    return 403 Forbidden
  }
}
```

#### Layer 2: JWT Token Validation
**File**: `src/libs/security/csrf.ts`

```typescript
export async function validateCSRFToken(
  headerToken: string | null,
  cookieToken: string | null
): Promise<boolean> {
  // 1. Check header token exists
  if (!headerToken) return false;
  
  // 2. Check cookie token exists
  if (!cookieToken) return false;
  
  // 3. Verify JWT signature
  const { payload } = await jwtVerify(cookieToken, CSRF_SECRET);
  
  // 4. Compare tokens
  if (payload.csrf !== headerToken) return false;
  
  // 5. Check expiration
  if (isExpired(payload.exp)) return false;
  
  return true;
}
```

#### Layer 3: API Route Wrapper
**File**: `src/libs/security/csrf-full.ts`

```typescript
// Usage in API routes
export const POST = withFullCsrfProtection(async (req) => {
  // CSRF validation happens automatically
  // Your handler code here
});
```

### Configuration

```typescript
// JWT Settings
const CSRF_SECRET = process.env.CSRF_SECRET; // 256-bit key
const CSRF_TOKEN_EXPIRY_SECONDS = 2 * 60 * 60; // 2 hours
const CSRF_COOKIE_NAME = "__Host-csrf-token"; // Production
// or "csrf-token" (Development)

// Cookie Options
{
  httpOnly: true,           // Prevents JS access
  secure: true,             // HTTPS only (production)
  sameSite: "strict",       // Prevents CSRF
  maxAge: 7200,            // 2 hours
  path: "/"                // Available site-wide
}
```

### Exemptions

```typescript
// Routes that skip CSRF (in middleware.ts)
const CSRF_EXEMPT = [
  '/api/auth/*',           // NextAuth handles own CSRF
  '/api/security/csrf',    // Token generation endpoint
  '/api/cron/*',           // Scheduled jobs (verified by token)
  '/api/webhooks/*'        // External webhooks (signed payload)
];
```

---

## 🔑 Authorization & Access Control

### Role-Based Access Control (RBAC)

| Role | Permissions | Routes |
|------|-------------|--------|
| **SuperAdmin** | Full system access | All routes |
| **Admin** | User management, content moderation | `/api/admin/*` (except users) |
| **User** | Own data only | `/api/user`, `/api/parts`, `/api/builds` |
| **Guest** | Public content only | `/api/public/*` |

### Implementation

#### Middleware Protection
**File**: `src/middleware.ts`

```typescript
export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    
    // Dashboard access: SuperAdmin only
    if (pathname.startsWith("/dashboard")) {
      if (!token) {
        return redirect("/accounts/sign-in");
      }
      if (token.role !== "superAdmin") {
        return redirect("/403");
      }
    }
    
    // Admin API: Admin or SuperAdmin
    if (pathname.startsWith("/api/admin/users")) {
      if (token?.role !== "superAdmin") {
        return 403 Forbidden;
      }
    }
  }
);
```

#### API Route Protection

```typescript
// Check authentication
const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

// Check authorization
if (session.user.role !== "superAdmin") {
  return NextResponse.json(
    { error: "Forbidden: Admin access required" },
    { status: 403 }
  );
}
```

### Resource Ownership

```typescript
// Example: User can only update own profile
const userId = session.user.id;
const requestedId = parseInt(req.nextUrl.searchParams.get('id'));

if (userId !== requestedId) {
  return NextResponse.json(
    { error: "Forbidden: Cannot modify other users" },
    { status: 403 }
  );
}
```

---

## 🗄️ Database Security

### Connection Security

**File**: `src/db/pool-config.ts`

```typescript
export function getPoolConfig(): PoolConfig {
  return {
    connectionString: process.env.DATABASE_URL,
    
    // SSL/TLS Configuration
    ssl: {
      rejectUnauthorized: false, // Dev: false, Prod: true
      ca: process.env.DB_SSL_CA, // Root certificate
    },
    
    // Connection Pool Limits
    max: 2,              // Max connections per worker
    min: 1,              // Min idle connections
    idleTimeoutMillis: 30000,    // Close idle after 30s
    connectionTimeoutMillis: 5000, // Connection timeout
    
    // Statement Timeout
    statement_timeout: 10000, // 10 seconds max query time
  };
}
```

### SQL Injection Prevention

**Using Drizzle ORM** (parameterized queries):

```typescript
// ❌ NEVER do this
const unsafe = await db.execute(
  `SELECT * FROM users WHERE email = '${userInput}'`
);

// ✅ ALWAYS do this
const safe = await db
  .select()
  .from(users)
  .where(eq(users.email, userInput));
```

### Database Permissions

```sql
-- Application user (limited permissions)
CREATE USER parts_app WITH PASSWORD 'secure_password';

GRANT CONNECT ON DATABASE parts_db TO parts_app;
GRANT USAGE ON SCHEMA public TO parts_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO parts_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO parts_app;

-- Revoke dangerous permissions
REVOKE CREATE ON SCHEMA public FROM parts_app;
REVOKE DROP ON ALL TABLES IN SCHEMA public FROM parts_app;
REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM parts_app;
```

### Encryption at Rest

- Database: PostgreSQL with AES-256 encryption
- Backups: Encrypted with GPG/PGP keys
- Secrets: AWS Secrets Manager or Vercel Environment Variables

---

## 🔒 API Security

### Input Validation

**Using Zod schemas**:

```typescript
import z from 'zod';

const partSchema = z.object({
  title: z.string().min(3).max(255),
  price: z.number().positive().max(999999),
  email: z.string().email(),
  url: z.string().url().optional(),
  status: z.enum(['active', 'inactive', 'draft']),
});

// Validate request
const validated = partSchema.parse(requestBody);
```

### Output Sanitization

```typescript
// HTML escaping (automatic with React)
<div>{userInput}</div> // React escapes by default

// Manual sanitization (if needed)
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(dirtyHTML);
```

### Rate Limiting

**File**: `src/db/schema/rateLimits.ts`

```typescript
// Rate limit configuration
const rateLimits = {
  '/api/auth/signin': { limit: 5, window: 60 },  // 5 per minute
  '/api/parts': { limit: 60, window: 60 },       // 60 per minute
  '/api/media/upload': { limit: 10, window: 60 }, // 10 per minute
};

// Implementation
if (requestCount > limit) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': resetTimestamp,
        'Retry-After': window,
      },
    }
  );
}
```

### Security Headers

**File**: `next.config.js`

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              font-src 'self' data:;
              connect-src 'self' https://api.yourdomain.com;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};
```

---

## 🔐 Data Protection

### Personal Data Handling

```typescript
// PII Fields (must be protected)
const PII_FIELDS = [
  'email',
  'password',
  'phone',
  'addressLine1',
  'addressLine2',
  'postalCode',
  'dateOfBirth',
  'ssn',
  'creditCard',
];

// Redact from logs
function sanitizeForLogging(data: any) {
  const sanitized = { ...data };
  PII_FIELDS.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  return sanitized;
}
```

### Data Retention

| Data Type | Retention Period | Deletion Method |
|-----------|-----------------|-----------------|
| User accounts | Until deletion request | Soft delete (anonymize) |
| Audit logs | 7 years | Hard delete after retention |
| Payment records | 7 years (tax law) | Encrypted archive |
| Session logs | 90 days | Auto-delete |
| Media files | Until manual deletion | Soft delete, then hard delete |

### Data Anonymization

```typescript
// Anonymize user data on account deletion
async function anonymizeUser(userId: number) {
  await db.update(users)
    .set({
      email: `deleted_${userId}@deleted.local`,
      username: `deleted_user_${userId}`,
      firstName: '[DELETED]',
      lastName: '[DELETED]',
      profileImage: null,
      bio: null,
      isActive: false,
      deletedAt: new Date(),
    })
    .where(eq(users.id, userId));
  
  // Keep audit trail but redact PII
  await logDataAccess('user_profile', userId, userId, 'delete');
}
```

---

## 📊 Audit Logging

### Winston Logger Configuration

**File**: `src/libs/logger.ts`

```typescript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Console (development)
    new winston.transports.Console(),
    
    // Files (production)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760,
      maxFiles: 10,
    }),
  ],
});
```

### Log Categories

#### 1. Authentication Events
```typescript
logAuthEvent('login', userId, {
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  success: true,
});
```

#### 2. API Requests
```typescript
logApiRequest('POST', '/api/parts', 201, userId, {
  duration: 150, // ms
  size: 2048, // bytes
});
```

#### 3. Security Events
```typescript
logSecurityEvent('csrf_violation', 'high', {
  ipAddress: req.ip,
  endpoint: req.url,
  reason: 'Invalid CSRF token',
});
```

#### 4. Data Access
```typescript
logDataAccess('user_profile', adminId, targetUserId, 'read', {
  fields: ['email', 'phone'],
  reason: 'Support ticket #12345',
});
```

#### 5. Payment Events (Future)
```typescript
logPaymentEvent('payment_completed', 99.99, 'AUD', userId, {
  orderId: '12345',
  method: 'credit_card',
  last4: '4242',
});
```

### Log Retention

```typescript
// Production: External logging service
if (process.env.NODE_ENV === 'production') {
  // Integrate with:
  // - Logtail (https://betterstack.com/logtail)
  // - Datadog (https://datadoghq.com)
  // - AWS CloudWatch
  
  logger.add(new LogtailTransport({
    sourceToken: process.env.LOGTAIL_TOKEN,
  }));
}
```

**7-Year Retention** (Australian compliance):
- Export logs monthly to S3/Azure Blob Storage
- Encrypt with AES-256
- Archive with lifecycle policies
- Searchable with AWS Athena or Azure Log Analytics

---

## 🚨 Incident Response

### Security Incident Procedure

#### 1. Detection
- Real-time alerts via Winston logger
- Anomaly detection (failed login spikes)
- User reports via support tickets

#### 2. Containment
```typescript
// Immediate actions
1. Block suspicious IP addresses (firewall/WAF)
2. Revoke compromised sessions
3. Rotate affected API keys/secrets
4. Enable additional logging
```

#### 3. Investigation
```typescript
// Analyze logs
const logs = await searchLogs({
  level: 'error',
  category: 'security',
  timeRange: [incidentStart, incidentEnd],
  ipAddress: suspiciousIP,
});

// Check affected users
const affectedUsers = await findUsersWithIP(suspiciousIP);
```

#### 4. Remediation
- Patch vulnerabilities
- Update security rules
- Force password resets (if needed)
- Notify affected users (if data breach)

#### 5. Post-Incident
- Document incident report
- Update security procedures
- Conduct team retrospective
- Implement preventive measures

### Notifiable Data Breach (NDB)

**Triggers**:
- Unauthorized access to personal information
- Loss of personal information
- Reasonable belief of serious harm

**Notification Timeline**:
- Notify OAIC (Office of the Australian Information Commissioner) within 72 hours
- Notify affected individuals "as soon as practicable"

**Template Email**:
```
Subject: Important Security Notification

Dear [Name],

We are writing to inform you of a security incident that may have affected 
your personal information. On [date], we discovered [brief description].

What happened:
[Details of incident]

What information was involved:
[List data types: email, name, etc.]

What we are doing:
[Response actions]

What you should do:
[Recommended user actions]

For questions, contact: security@yourdomain.com

Sincerely,
[Company Name] Security Team
```

---

## ✅ Security Best Practices

### For Developers

1. **Never Commit Secrets**
   ```bash
   # Use .env.local (in .gitignore)
   DATABASE_URL=...
   NEXTAUTH_SECRET=...
   
   # Check before commit
   git secrets --scan
   ```

2. **Keep Dependencies Updated**
   ```bash
   # Check for vulnerabilities
   npm audit
   
   # Update packages
   npm update
   
   # Fix vulnerabilities
   npm audit fix
   ```

3. **Use TypeScript Strict Mode**
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true
     }
   }
   ```

4. **Validate All Inputs**
   ```typescript
   // Use Zod schemas for validation
   const schema = z.object({ ... });
   const validated = schema.parse(input);
   ```

5. **Sanitize All Outputs**
   ```typescript
   // React auto-escapes
   <div>{userInput}</div>
   
   // For HTML content
   import DOMPurify from 'isomorphic-dompurify';
   const clean = DOMPurify.sanitize(html);
   ```

### For Administrators

1. **Regular Security Audits**
   - Monthly dependency checks
   - Quarterly penetration testing
   - Annual third-party security audit

2. **Access Control Review**
   - Review user roles monthly
   - Remove inactive accounts
   - Audit admin access logs

3. **Backup Verification**
   - Test restore process monthly
   - Verify backup integrity
   - Check encryption keys

4. **Monitoring & Alerts**
   - Set up alerts for failed logins (>5 in 1 minute)
   - Monitor for unusual traffic patterns
   - Review security logs weekly

5. **Disaster Recovery Plan**
   - Document RTO (Recovery Time Objective): 4 hours
   - Document RPO (Recovery Point Objective): 1 hour
   - Test DR plan quarterly

### For Users

1. **Strong Passwords**
   - Minimum 12 characters
   - Mix of upper/lower/numbers/symbols
   - Use password manager

2. **Enable MFA**
   - OTP via email/SMS
   - Authenticator app (future)

3. **Review Account Activity**
   - Check login history
   - Report suspicious activity
   - Update contact info

4. **Secure Connections**
   - Always use HTTPS
   - Avoid public WiFi
   - Keep browser updated


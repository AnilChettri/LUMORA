# Security Guidelines

## Overview

This document outlines security best practices for the Brainimation application.

## Authentication & Authorization

### Secure Password Storage

```typescript
// server/auth.ts
import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Usage
const hashedPassword = await hashPassword(userPassword);
const isValid = await verifyPassword(inputPassword, user.password);
```

### Session Security

```typescript
// server/index.ts
import session from 'express-session';
import RedisStore from 'connect-redis';

app.use(session({
  store: new RedisStore(),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));
```

### JWT Tokens

```typescript
import jwt from 'jsonwebtoken';

export function generateToken(userId: string): string {
  return jwt.sign(
    { userId, iat: Date.now() },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
}

// Middleware
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = verifyToken(token);
    (req as any).userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
```

## Input Validation

### Data Validation with Zod

```typescript
// shared/schema.ts
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password too short'),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string(),
  createdAt: z.date(),
});

// Usage
try {
  const validated = LoginSchema.parse(req.body);
  // Safe to use
} catch (error) {
  res.status(400).json({ message: 'Validation failed' });
}
```

### Sanitizing Input

```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

// Usage
const cleanContent = sanitizeInput(userInput);
```

## Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from 'redis';

const client = redis.createClient();

const limiter = rateLimit({
  store: new RedisStore({
    client,
    prefix: 'rl:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

// Apply to sensitive endpoints
app.post('/api/auth/login', limiter, authController.login);
app.post('/api/auth/register', limiter, authController.register);
```

## CORS Configuration

```typescript
import cors from 'cors';

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://brainimation.com',
    'https://app.brainimation.com',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

## CSRF Protection

```typescript
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

app.use(cookieParser());

const csrfProtection = csrf({ cookie: false });

app.post('/api/form', csrfProtection, (req, res) => {
  // CSRF token validated
  res.json({ message: 'Form processed' });
});

// Send CSRF token to client
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

## Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet());

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  },
}));

app.use(helmet.hsts({
  maxAge: 31536000, // 1 year
  includeSubDomains: true,
  preload: true,
}));
```

## HTTPS Configuration

### Self-Signed Certificate (Development)

```bash
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

### Production (Let's Encrypt)

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d brainimation.com -d api.brainimation.com
```

### Express Configuration

```typescript
import https from 'https';
import fs from 'fs';

if (process.env.NODE_ENV === 'production') {
  const key = fs.readFileSync('/etc/letsencrypt/live/brainimation.com/privkey.pem');
  const cert = fs.readFileSync('/etc/letsencrypt/live/brainimation.com/fullchain.pem');
  
  https.createServer({ key, cert }, app).listen(443);
}
```

## Database Security

### SQL Injection Prevention

Use parameterized queries with Drizzle ORM:

```typescript
// ✅ Safe - uses parameterized query
const user = await db.query
  .from(users)
  .where(eq(users.email, userInput))
  .first();

// ❌ Never do this!
const user = await db.query(`SELECT * FROM users WHERE email = '${userInput}'`);
```

### Database User Permissions

```sql
-- Create application user with limited permissions
CREATE USER app_user WITH PASSWORD 'strong_password';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE brainimation TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;

-- Revoke dangerous permissions
REVOKE DROP ON DATABASE brainimation FROM app_user;
REVOKE CREATE ON SCHEMA public FROM app_user;
```

### Connection Pooling

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  max: 20,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});
```

## Environment Variable Security

### Never Commit Secrets

```bash
# ✅ Good
cat .env.example
DATABASE_URL=postgresql://user:pass@localhost/db
SESSION_SECRET=your-secret-here

# ❌ Bad
cat .env
DATABASE_URL=postgresql://prod_user:actual_pass@prod.db/prod_db
SESSION_SECRET=actual_production_secret
```

### Use Secrets Management

```bash
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id brainimation/prod

# HashiCorp Vault
vault kv get secret/brainimation/prod
```

## Dependency Security

### Regular Updates

```bash
# Check for vulnerabilities
npm audit

# Fix known vulnerabilities
npm audit fix

# Update dependencies safely
npm update --depth 3
```

### Lock File Management

- Always commit `package-lock.json`
- Never modify lock file manually
- Use `npm ci` in CI/CD pipelines

## API Security

### API Key Management

```typescript
// server/middleware/apiKey.ts
export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || !isValidApiKey(apiKey as string)) {
    return res.status(401).json({ message: 'Invalid API key' });
  }
  
  next();
}

function isValidApiKey(key: string): boolean {
  const validKeys = new Set(process.env.VALID_API_KEYS?.split(',') || []);
  return validKeys.has(key);
}
```

### API Versioning

```typescript
// Use versioned endpoints
app.post('/api/v1/users', (req, res) => {
  // v1 endpoint
});

app.post('/api/v2/users', (req, res) => {
  // v2 endpoint with improved security
});
```

## Data Protection

### Encryption at Rest

```typescript
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### PII Data Handling

```typescript
// Mask sensitive data in logs
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  return `${name[0]}***@${domain}`;
}

// Never log passwords or tokens
logger.info('User login attempt', {
  email: maskEmail(user.email),
  // Never include password!
});
```

## Backup & Disaster Recovery

### Database Backup

```bash
#!/bin/bash
# scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL | gzip > backups/db_$DATE.sql.gz

# Upload to S3
aws s3 cp backups/db_$DATE.sql.gz s3://brainimation-backups/
```

### Backup Rotation

```bash
# Keep only last 30 days of backups
find backups/ -name "*.sql.gz" -mtime +30 -delete
```

## Security Checklist

- [ ] All dependencies updated and audited
- [ ] Secrets stored in environment variables
- [ ] HTTPS enforced in production
- [ ] Rate limiting enabled on APIs
- [ ] Input validation on all endpoints
- [ ] SQL injection protection via ORM
- [ ] CORS configured properly
- [ ] Security headers set
- [ ] CSRF protection enabled
- [ ] Database user has limited permissions
- [ ] Backups tested and verified
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't include secrets
- [ ] API keys rotated regularly
- [ ] Sessions configured securely
- [ ] Password requirements enforced
- [ ] PII encryption implemented
- [ ] Monitoring and alerting enabled
- [ ] Incident response plan documented
- [ ] Security updates applied promptly

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email security@brainimation.com with details
3. Include affected versions and reproduction steps
4. Allow 30 days for a fix before public disclosure

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-syntax.html)

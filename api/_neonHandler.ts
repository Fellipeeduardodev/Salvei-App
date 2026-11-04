import { neon } from '@neondatabase/serverless';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { sendWelcomeEmail, sendPasswordResetEmail, sendTestEmail, getAppBaseUrl } from './_emailService.js';
import {
  globalRateLimiter,
  RATE_LIMIT_POLICIES,
  getClientIp,
  getRateLimitHeaders,
} from './_rateLimiter.js';
import {
  isValidEmail,
  validatePassword,
  sanitizeString,
  safeResolveUploadPath,
  DUMMY_PASSWORD_HASH,
  getStandardSecurityHeaders,
} from './_security.js';

export {
  globalRateLimiter,
  RATE_LIMIT_POLICIES,
  getClientIp,
  getRateLimitHeaders,
  isValidEmail,
  validatePassword,
  sanitizeString,
  safeResolveUploadPath,
  DUMMY_PASSWORD_HASH,
};

export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) return match[1];
    }
  } catch {}
  return '';
}

export function getSql() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error('DATABASE_URL_NOT_CONFIGURED');
  }
  return neon(url);
}

// Lazy SQL query executor
export const sql = new Proxy(function () {} as any, {
  apply(_target, _thisArg, args) {
    const fn = getSql();
    return (fn as any)(...args);
  },
  get(_target, prop) {
    const fn = getSql();
    return (fn as any)[prop];
  },
});

// Real password hashing with salt + scrypt
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// Constant-time password verification against stored salt:hash
export function verifyPassword(password: string, storedHash?: string | null): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  try {
    const [salt, key] = storedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

const RESET_TOKEN_SECRET = process.env.RESET_SECRET || 'salvei-secure-pwd-reset-salt-2026';

export function generateResetToken(userId: string, currentPasswordHash: string): string {
  const expiresAt = Date.now() + 3600 * 1000; // 1 hora de validade
  const payload = `${userId}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', RESET_TOKEN_SECRET)
    .update(`${payload}:${currentPasswordHash}`)
    .digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
}

export function verifyResetToken(token: string, currentPasswordHash: string): { valid: boolean; userId?: string } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length < 3) return { valid: false };
    const [userId, expiresAtStr, signature] = parts;
    if (!userId || !expiresAtStr || !signature) return { valid: false };

    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) return { valid: false };

    const payload = `${userId}:${expiresAtStr}`;
    const expectedHmac = crypto.createHmac('sha256', RESET_TOKEN_SECRET)
      .update(`${payload}:${currentPasswordHash}`)
      .digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedHmac, 'hex'))) {
      return { valid: true, userId };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

// Helper to read JSON request body safely with strict payload size limit (DoS prevention)
export function parseBody(req: any, maxBytes: number = 10 * 1024 * 1024): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return Promise.resolve(req.body);
    }
    if (typeof req.body === 'string') {
      if (req.body.length > maxBytes) {
        return Promise.reject(new Error('PAYLOAD_TOO_LARGE'));
      }
      try {
        return Promise.resolve(JSON.parse(req.body));
      } catch {
        return Promise.resolve({});
      }
    }
    if (Buffer.isBuffer(req.body)) {
      if (req.body.length > maxBytes) {
        return Promise.reject(new Error('PAYLOAD_TOO_LARGE'));
      }
      try {
        return Promise.resolve(JSON.parse(req.body.toString('utf8')));
      } catch {
        return Promise.resolve({});
      }
    }
  }

  if (req.readableEnded || req.complete) {
    return Promise.resolve({});
  }

  return new Promise((resolve, reject) => {
    let data = '';
    let bytesReceived = 0;

    const onData = (chunk: any) => {
      const len = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(String(chunk));
      bytesReceived += len;
      if (bytesReceived > maxBytes) {
        req.pause?.();
        reject(new Error('PAYLOAD_TOO_LARGE'));
        return;
      }
      data += chunk;
    };

    req.on('data', onData);
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', (err: any) => reject(err));
  });
}

export function sendJson(
  res: any,
  status: number,
  data: any,
  additionalHeaders?: Record<string, string>
) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // OWASP Standard Security Headers
  const secHeaders = getStandardSecurityHeaders();
  for (const [key, val] of Object.entries(secHeaders)) {
    res.setHeader(key, val);
  }

  if (additionalHeaders) {
    for (const [key, val] of Object.entries(additionalHeaders)) {
      res.setHeader(key, val);
    }
  }

  res.end(JSON.stringify(data));
}

/**
 * Main request router for Neon API endpoints.
 * Compatible with Vite dev server middleware and Vercel Serverless Function runtime.
 */
export async function handleNeonApiRequest(req: any, res: any): Promise<boolean> {
  // Handle CORS Preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.end();
    return true;
  }

  const host = req.headers?.host || 'localhost';
  const rawUrl = req.url || '/';

  // Early Path Traversal Detection on raw URL before URL parser normalization
  const rawPath = rawUrl.split('?')[0];
  if (rawPath.startsWith('/uploads/') || rawPath.startsWith('/uploads') || rawPath.includes('/uploads/')) {
    if (
      rawPath.includes('..') ||
      rawPath.includes('%2e') ||
      rawPath.includes('%2E') ||
      rawPath.includes('%2f') ||
      rawPath.includes('%2F') ||
      rawPath.includes('%5c') ||
      rawPath.includes('%5C')
    ) {
      sendJson(res, 403, { error: 'Acesso negado: tentativa de travessia de diretório detectada.' });
      return true;
    }
  }

  const url = new URL(rawUrl, `http://${host}`);

  let pathname = url.pathname;

  // 1. If routed via /api/index?path=... or /api?path=...
  const pathParam = url.searchParams.get('path');
  if ((pathname === '/api/index' || pathname === '/api' || pathname === '/' || pathname === '/index') && pathParam) {
    pathname = pathParam.startsWith('/api')
      ? pathParam
      : `/api${pathParam.startsWith('/') ? pathParam : '/' + pathParam}`;
  }

  // 2. Check Vercel rewrite headers if pathname is still /api/index or /api
  const vercelMatchedPath = (req.headers?.['x-matched-path'] || req.headers?.['x-vercel-matched-path'] || req.headers?.['x-forwarded-uri']) as string | undefined;
  if (vercelMatchedPath && (pathname === '/api/index' || pathname === '/api' || pathname === '/' || pathname === '/index')) {
    pathname = vercelMatchedPath.split('?')[0];
  }

  // 3. Normalize pathname to always start with /api (unless static /uploads/) and strip trailing slash
  if (!pathname.startsWith('/api') && !pathname.startsWith('/uploads')) {
    pathname = `/api${pathname.startsWith('/') ? pathname : '/' + pathname}`;
  }
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.replace(/\/+$/, '');
  }

  if (!pathname.startsWith('/api') && !pathname.startsWith('/uploads/')) {
    return false;
  }

  const clientIp = getClientIp(req);

  // 0. HEALTH CHECK / TELEMETRY
  if (pathname === '/api/ping') {
    sendJson(res, 200, {
      ok: true,
      version: '1.0.2',
      hasDbUrl: Boolean(getDatabaseUrl()),
      hasResendKey: Boolean(process.env.RESEND_API_KEY),
      resendFrom: process.env.RESEND_FROM_EMAIL || 'Salvei <ola@salvei.tech>',
      appUrl: process.env.APP_URL || 'https://salvei.tech',
      node: process.version,
      clientIp,
      timestamp: new Date().toISOString(),
    });
    return true;
  }

  // 1. STATIC FILE SERVING WITH STRICT PATH TRAVERSAL GUARD
  if (pathname.startsWith('/uploads/') && req.method === 'GET') {
    const uploadsBaseDir = path.resolve(process.cwd(), 'public', 'uploads');
    const requestedSub = pathname.replace(/^\/uploads\/?/, '').split('?')[0];

    const { safe, resolvedPath } = safeResolveUploadPath(uploadsBaseDir, requestedSub);
    if (!safe) {
      sendJson(res, 403, { error: 'Acesso negado: tentativa de travessia de diretório detectada.' });
      return true;
    }

    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
      const ext = path.extname(resolvedPath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
      };
      const stream = fs.createReadStream(resolvedPath);
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      });
      stream.pipe(res);
      return true;
    }

    sendJson(res, 404, { error: 'Arquivo não encontrado.' });
    return true;
  }

  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    sendJson(res, 500, {
      error: 'DATABASE_URL não configurada no servidor Vercel. Adicione a variável de ambiente no painel do projeto na Vercel.',
    });
    return true;
  }

  try {
    // 1. AUTH: LOGIN (Brute Force Protected by IP and Target Account)
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      // 1.1 IP-level limit check (protects against credential stuffing across thousands of accounts)
      const ipLimit = globalRateLimiter.consume(`login_ip:${clientIp}`, RATE_LIMIT_POLICIES.LOGIN_PER_IP);
      if (!ipLimit.allowed) {
        sendJson(
          res,
          429,
          {
            error: RATE_LIMIT_POLICIES.LOGIN_PER_IP.message,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: ipLimit.retryAfterSec,
          },
          getRateLimitHeaders(ipLimit)
        );
        return true;
      }

      let body: any;
      try {
        body = await parseBody(req, 64 * 1024);
      } catch (err: any) {
        if (err.message === 'PAYLOAD_TOO_LARGE') {
          sendJson(res, 413, { error: 'O tamanho da requisição excede o limite permitido (Payload Too Large).' });
          return true;
        }
        throw err;
      }

      const { email, password } = body || {};
      if (!email || !password) {
        sendJson(res, 400, { error: 'E-mail e senha são obrigatórios.' });
        return true;
      }

      const cleanEmail = String(email).trim().toLowerCase();

      // Email format validation
      if (!isValidEmail(cleanEmail)) {
        sendJson(res, 400, { error: 'Formato de e-mail inválido.' });
        return true;
      }

      // Password length validation (prevents CPU exhaustion on scrypt)
      const pwdValidation = validatePassword(password);
      if (!pwdValidation.valid) {
        sendJson(res, 400, { error: pwdValidation.error });
        return true;
      }

      // 1.2 Account-specific brute force check (IP + Email)
      const accountKey = `login_acc:${clientIp}:${cleanEmail}`;
      const accountLimit = globalRateLimiter.consume(accountKey, RATE_LIMIT_POLICIES.LOGIN_PER_ACCOUNT);
      if (!accountLimit.allowed) {
        sendJson(
          res,
          429,
          {
            error: RATE_LIMIT_POLICIES.LOGIN_PER_ACCOUNT.message,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: accountLimit.retryAfterSec,
          },
          getRateLimitHeaders(accountLimit)
        );
        return true;
      }

      const users = await sql`
        SELECT u.id, u.email, u.full_name, u.password_hash, p.avatar_url, p.onboarding_completed, p.preferences
        FROM users u
        LEFT JOIN profiles p ON p.id = u.id
        WHERE LOWER(u.email) = ${cleanEmail}
        LIMIT 1;
      `;

      if (users.length === 0) {
        // Timing attack mitigation: run constant-time scrypt against dummy hash
        verifyPassword(String(password), DUMMY_PASSWORD_HASH);
        sendJson(res, 401, { error: 'E-mail ou senha incorretos.' });
        return true;
      }

      const user = users[0];
      const isValidPassword = verifyPassword(String(password), user.password_hash);
      if (!isValidPassword) {
        sendJson(res, 401, { error: 'E-mail ou senha incorretos.' });
        return true;
      }

      // SUCCESS: Clear failed attempt counter for this user/IP pair
      globalRateLimiter.reset(accountKey);

      const profile = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        onboarding_completed: user.onboarding_completed ?? true,
        preferences: user.preferences || { theme: 'light', shortcuts_enabled: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      sendJson(res, 200, {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: { full_name: user.full_name },
        },
        profile,
        session: {
          access_token: `neon_session_${user.id}_${Date.now()}`,
          user: { id: user.id, email: user.email },
        },
      });
      return true;
    }

    // 2. AUTH: SIGNUP (Registration Flood Protection)
    if ((pathname === '/api/auth/signup' || pathname === '/api/auth/register') && req.method === 'POST') {
      const signupLimit = globalRateLimiter.consume(`signup_ip:${clientIp}`, RATE_LIMIT_POLICIES.SIGNUP_PER_IP);
      if (!signupLimit.allowed) {
        sendJson(
          res,
          429,
          {
            error: RATE_LIMIT_POLICIES.SIGNUP_PER_IP.message,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: signupLimit.retryAfterSec,
          },
          getRateLimitHeaders(signupLimit)
        );
        return true;
      }

      let body: any;
      try {
        body = await parseBody(req, 64 * 1024);
      } catch (err: any) {
        if (err.message === 'PAYLOAD_TOO_LARGE') {
          sendJson(res, 413, { error: 'O tamanho da requisição excede o limite permitido.' });
          return true;
        }
        throw err;
      }

      const { email, password, fullName } = body || {};
      if (!email || !password) {
        sendJson(res, 400, { error: 'E-mail e senha são obrigatórios.' });
        return true;
      }

      const cleanEmail = String(email).trim().toLowerCase();
      if (!isValidEmail(cleanEmail)) {
        sendJson(res, 400, { error: 'Formato de e-mail inválido.' });
        return true;
      }

      const pwdValidation = validatePassword(password);
      if (!pwdValidation.valid) {
        sendJson(res, 400, { error: pwdValidation.error });
        return true;
      }

      const cleanName = sanitizeString(fullName || cleanEmail.split('@')[0], 80);

      const existing = await sql`
        SELECT id FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1;
      `;

      if (existing.length > 0) {
        sendJson(res, 400, { error: 'Este endereço de e-mail já está cadastrado. Tente entrar.' });
        return true;
      }

      const passwordHash = hashPassword(String(password));
      const inserted = await sql`
        INSERT INTO users (email, full_name, password_hash)
        VALUES (${cleanEmail}, ${cleanName}, ${passwordHash})
        RETURNING id, email, full_name;
      `;
      const userId = inserted[0].id;

      await sql`
        INSERT INTO profiles (id, email, full_name, onboarding_completed, preferences)
        VALUES (${userId}, ${cleanEmail}, ${cleanName}, true, '{"theme": "light", "shortcuts_enabled": true}')
        ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
      `;

      const profile = {
        id: userId,
        email: cleanEmail,
        full_name: cleanName,
        avatar_url: null,
        onboarding_completed: true,
        preferences: { theme: 'light', shortcuts_enabled: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      sendJson(res, 200, {
        user: {
          id: userId,
          email: cleanEmail,
          user_metadata: { full_name: cleanName },
        },
        profile,
        session: {
          access_token: `neon_session_${userId}_${Date.now()}`,
          user: { id: userId, email: cleanEmail },
        },
      });

      // Envio de boas-vindas assíncrono via Resend
      sendWelcomeEmail(cleanEmail, cleanName).catch((err) => {
        console.warn('[Resend] Falha ao enviar e-mail de boas-vindas:', err);
      });

      return true;
    }

    // 2.1 AUTH: FORGOT PASSWORD (Rate-Limited per IP and per Target Email)
    if (pathname === '/api/auth/forgot-password' && req.method === 'POST') {
      const ipLimit = globalRateLimiter.consume(`forgot_ip:${clientIp}`, RATE_LIMIT_POLICIES.FORGOT_PASSWORD_PER_IP);
      if (!ipLimit.allowed) {
        sendJson(
          res,
          429,
          {
            error: RATE_LIMIT_POLICIES.FORGOT_PASSWORD_PER_IP.message,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: ipLimit.retryAfterSec,
          },
          getRateLimitHeaders(ipLimit)
        );
        return true;
      }

      let body: any;
      try {
        body = await parseBody(req, 64 * 1024);
      } catch (err: any) {
        if (err.message === 'PAYLOAD_TOO_LARGE') {
          sendJson(res, 413, { error: 'O tamanho da requisição excede o limite permitido.' });
          return true;
        }
        throw err;
      }

      const { email } = body || {};
      if (!email) {
        sendJson(res, 400, { error: 'E-mail é obrigatório.' });
        return true;
      }

      const cleanEmail = String(email).trim().toLowerCase();
      if (!isValidEmail(cleanEmail)) {
        sendJson(res, 400, { error: 'Formato de e-mail inválido.' });
        return true;
      }

      // Rate limit per target email (stops flooding recipient inbox & exhausting Resend limits)
      const emailLimit = globalRateLimiter.consume(`forgot_email:${cleanEmail}`, RATE_LIMIT_POLICIES.FORGOT_PASSWORD_PER_EMAIL);
      if (!emailLimit.allowed) {
        sendJson(
          res,
          429,
          {
            error: RATE_LIMIT_POLICIES.FORGOT_PASSWORD_PER_EMAIL.message,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: emailLimit.retryAfterSec,
          },
          getRateLimitHeaders(emailLimit)
        );
        return true;
      }

      try {
        const users = await sql`
          SELECT id, email, full_name, password_hash
          FROM users
          WHERE LOWER(email) = ${cleanEmail}
          LIMIT 1;
        `;

        if (users.length > 0) {
          const user = users[0];
          const token = generateResetToken(user.id, user.password_hash);
          const baseUrl = getAppBaseUrl();
          const resetUrl = `${baseUrl}/?resetToken=${token}`;

          await sendPasswordResetEmail(user.email, resetUrl, user.full_name);
        }
      } catch (emailErr) {
        console.error('[Resend Password Reset Error]', emailErr);
      }

      // Resposta uniforme de segurança para prevenir enumeração de contas
      sendJson(res, 200, {
        success: true,
        message: 'Se o endereço estiver cadastrado, você receberá um e-mail com as instruções em instantes.',
      });
      return true;
    }

    // 2.2 AUTH: RESET PASSWORD (Rate-Limited per IP)
    if (pathname === '/api/auth/reset-password' && req.method === 'POST') {
      const resetLimit = globalRateLimiter.consume(`reset_ip:${clientIp}`, RATE_LIMIT_POLICIES.RESET_PASSWORD_PER_IP);
      if (!resetLimit.allowed) {
        sendJson(
          res,
          429,
          {
            error: RATE_LIMIT_POLICIES.RESET_PASSWORD_PER_IP.message,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: resetLimit.retryAfterSec,
          },
          getRateLimitHeaders(resetLimit)
        );
        return true;
      }

      let body: any;
      try {
        body = await parseBody(req, 64 * 1024);
      } catch (err: any) {
        if (err.message === 'PAYLOAD_TOO_LARGE') {
          sendJson(res, 413, { error: 'O tamanho da requisição excede o limite permitido.' });
          return true;
        }
        throw err;
      }

      const { token, newPassword } = body || {};
      if (!token || !newPassword) {
        sendJson(res, 400, { error: 'Token e nova senha são obrigatórios.' });
        return true;
      }

      const pwdValidation = validatePassword(newPassword);
      if (!pwdValidation.valid) {
        sendJson(res, 400, { error: pwdValidation.error });
        return true;
      }

      let userId = '';
      try {
        const decoded = Buffer.from(String(token), 'base64url').toString('utf8');
        userId = decoded.split(':')[0];
      } catch {
        sendJson(res, 400, { error: 'Token de recuperação inválido.' });
        return true;
      }

      if (!userId) {
        sendJson(res, 400, { error: 'Token de recuperação inválido.' });
        return true;
      }

      const users = await sql`
        SELECT id, password_hash FROM users WHERE id = ${userId} LIMIT 1;
      `;

      if (users.length === 0) {
        sendJson(res, 400, { error: 'Usuário não encontrado.' });
        return true;
      }

      const user = users[0];
      const { valid } = verifyResetToken(String(token), user.password_hash);
      if (!valid) {
        sendJson(res, 400, { error: 'Este link de recuperação expirou ou já foi utilizado. Solicite um novo link.' });
        return true;
      }

      const newHash = hashPassword(String(newPassword));
      await sql`
        UPDATE users SET password_hash = ${newHash} WHERE id = ${userId};
      `;

      sendJson(res, 200, { success: true, message: 'Senha atualizada com sucesso!' });
      return true;
    }

    // 2.3 EMAIL: TEST / HEALTH CHECK (Strictly restricted in production)
    if (pathname === '/api/email/test' && (req.method === 'POST' || req.method === 'GET')) {
      const testLimit = globalRateLimiter.consume(`email_test_ip:${clientIp}`, RATE_LIMIT_POLICIES.EMAIL_TEST_PER_IP);
      if (!testLimit.allowed) {
        sendJson(
          res,
          429,
          {
            error: RATE_LIMIT_POLICIES.EMAIL_TEST_PER_IP.message,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: testLimit.retryAfterSec,
          },
          getRateLimitHeaders(testLimit)
        );
        return true;
      }

      const isProduction = process.env.NODE_ENV === 'production';
      const adminSecret = process.env.ADMIN_SECRET || process.env.RESEND_TEST_SECRET;
      const authHeader = req.headers?.authorization?.replace(/^Bearer\s+/i, '') || url.searchParams.get('key');

      if (isProduction && (!adminSecret || authHeader !== adminSecret)) {
        sendJson(res, 403, {
          error: 'Endpoint de teste restrito a ambiente de desenvolvimento ou chave de administrador autorizada.',
        });
        return true;
      }

      const body = req.method === 'POST' ? await parseBody(req, 64 * 1024) : {};
      const targetEmail = body?.to || url.searchParams.get('to');

      if (!targetEmail) {
        sendJson(res, 400, { error: 'Parâmetro "to" (destinatário) é obrigatório.' });
        return true;
      }

      const cleanTarget = String(targetEmail).trim();
      if (!isValidEmail(cleanTarget)) {
        sendJson(res, 400, { error: 'Endereço de e-mail do destinatário é inválido.' });
        return true;
      }

      const sendResult = await sendTestEmail(cleanTarget);
      if (!sendResult.success) {
        sendJson(res, 500, { error: sendResult.error || 'Falha ao enviar e-mail de teste.' });
        return true;
      }

      sendJson(res, 200, {
        success: true,
        message: `E-mail de teste enviado com sucesso para ${cleanTarget}`,
        id: sendResult.id,
      });
      return true;
    }

    // --- GLOBAL API RATE LIMITING FOR ALL SUBSEQUENT DATA ENDPOINTS ---
    const apiLimit = globalRateLimiter.consume(`global_api:${clientIp}`, RATE_LIMIT_POLICIES.GLOBAL_API_PER_IP);
    if (!apiLimit.allowed) {
      sendJson(
        res,
        429,
        {
          error: RATE_LIMIT_POLICIES.GLOBAL_API_PER_IP.message,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: apiLimit.retryAfterSec,
        },
        getRateLimitHeaders(apiLimit)
      );
      return true;
    }

    // 3. FETCH FULL USER LIBRARY
    if (pathname === '/api/library' && req.method === 'GET') {
      const userId = url.searchParams.get('userId');
      if (!userId) {
        sendJson(res, 400, { error: 'userId obrigatório' });
        return true;
      }

      const rawRefs = await sql`
        SELECT 
          r.id,
          r.title,
          r.url,
          r.domain,
          r.screenshot_url as "screenshotUrl",
          r.image_storage_path as "imageStorageId",
          r.original_file_name as "originalFileName",
          r.screenshot_status as "screenshotStatus",
          r.source_type as "sourceType",
          r.notes_markdown as "notesMarkdown",
          r.is_favorite as "isFavorite",
          r.palette,
          r.created_at as "createdAt",
          r.updated_at as "updatedAt",
          COALESCE(
            (SELECT json_agg(t.name) 
              FROM reference_tags rt 
              JOIN tags t ON t.id = rt.tag_id 
              WHERE rt.reference_id = r.id),
            '[]'::json
          ) as tags,
          COALESCE(
            (SELECT json_agg(pr.project_id) 
              FROM project_references pr 
              WHERE pr.reference_id = r.id),
            '[]'::json
          ) as "projectIds",
          COALESCE(
            (SELECT json_agg(cr.collection_id) 
              FROM collection_references cr 
              WHERE cr.reference_id = r.id),
            '[]'::json
          ) as "collectionIds"
        FROM "references" r
        WHERE r.user_id = ${userId}
        ORDER BY r.created_at DESC;
      `;

      const projects = await sql`
        SELECT id, name, description, created_at as "createdAt", updated_at as "updatedAt"
        FROM projects
        WHERE user_id = ${userId}
        ORDER BY created_at DESC;
      `;

      const collections = await sql`
        SELECT id, name, description, created_at as "createdAt", updated_at as "updatedAt"
        FROM collections
        WHERE user_id = ${userId}
        ORDER BY created_at DESC;
      `;

      const tags = await sql`
        SELECT name FROM tags WHERE user_id = ${userId} ORDER BY name ASC;
      `;

      const mappedRefs = rawRefs.map((r: any) => ({
        ...r,
        palette: r.palette || [],
        codeSnippets: [],
        relatedFiles: [],
        isFavorite: Boolean(r.isFavorite),
      }));

      sendJson(res, 200, {
        references: mappedRefs,
        projects,
        collections,
        tags: tags.map((t: any) => t.name),
      });
      return true;
    }

    // 4. FETCH PROFILE
    if (pathname === '/api/profile' && req.method === 'GET') {
      const userId = url.searchParams.get('userId');
      if (!userId) {
        sendJson(res, 400, { error: 'userId obrigatório' });
        return true;
      }

      const rows = await sql`
        SELECT id, email, full_name, avatar_url, onboarding_completed, preferences, created_at, updated_at
        FROM profiles WHERE id = ${userId} LIMIT 1;
      `;

      if (rows.length === 0) {
        sendJson(res, 200, null);
        return true;
      }
      sendJson(res, 200, rows[0]);
      return true;
    }

    // 5. UPDATE PROFILE
    if (pathname === '/api/profile' && req.method === 'PUT') {
      const body = await parseBody(req, 512 * 1024);
      const { userId, updates } = body || {};
      if (!userId) {
        sendJson(res, 400, { error: 'userId obrigatório' });
        return true;
      }

      await sql`
        UPDATE profiles
        SET 
          full_name = COALESCE(${updates?.full_name ? sanitizeString(updates.full_name, 100) : null}, full_name),
          avatar_url = COALESCE(${updates?.avatar_url}, avatar_url),
          onboarding_completed = COALESCE(${updates?.onboarding_completed}, onboarding_completed),
          preferences = COALESCE(${updates?.preferences ? JSON.stringify(updates.preferences) : null}::jsonb, preferences),
          updated_at = now()
        WHERE id = ${userId};
      `;
      sendJson(res, 200, { success: true });
      return true;
    }

    // 6. SAVE / CREATE REFERENCE
    if (pathname === '/api/references' && req.method === 'POST') {
      const body = await parseBody(req, 2 * 1024 * 1024);
      const { userId, reference } = body || {};

      if (!userId || !reference?.id || !reference?.title) {
        sendJson(res, 400, { error: 'Dados da referência incompletos.' });
        return true;
      }

      await sql`
        INSERT INTO "references" (
          id, user_id, title, url, domain, screenshot_url, image_storage_path,
          screenshot_status, source_type, original_file_name, notes_markdown, is_favorite, palette
        ) VALUES (
          ${reference.id}, ${userId}, ${sanitizeString(reference.title, 255)}, ${reference.url || null},
          ${reference.domain || null}, ${reference.screenshotUrl || null}, ${reference.imageStorageId || null},
          ${reference.screenshotStatus || 'none'}, ${reference.sourceType || 'url'},
          ${reference.originalFileName || null}, ${reference.notesMarkdown || ''},
          ${Boolean(reference.isFavorite)}, ${reference.palette ? JSON.stringify(reference.palette) : '[]'}::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          url = EXCLUDED.url,
          domain = EXCLUDED.domain,
          screenshot_url = EXCLUDED.screenshot_url,
          image_storage_path = EXCLUDED.image_storage_path,
          screenshot_status = EXCLUDED.screenshot_status,
          source_type = EXCLUDED.source_type,
          notes_markdown = EXCLUDED.notes_markdown,
          is_favorite = EXCLUDED.is_favorite,
          palette = EXCLUDED.palette,
          updated_at = now();
      `;

      // Sync tags
      if (Array.isArray(reference.tags)) {
        for (const tag of reference.tags) {
          const cleanTag = sanitizeString(String(tag), 50);
          if (!cleanTag) continue;
          const tagId = `tag-${cleanTag.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`;
          await sql`
            INSERT INTO tags (id, user_id, name, slug)
            VALUES (${tagId}, ${userId}, ${cleanTag}, ${cleanTag.toLowerCase()})
            ON CONFLICT (id) DO NOTHING;
          `;
          await sql`
            INSERT INTO reference_tags (reference_id, tag_id)
            VALUES (${reference.id}, ${tagId})
            ON CONFLICT DO NOTHING;
          `;
        }
      }

      // Sync projects
      if (Array.isArray(reference.projectIds)) {
        for (const pId of reference.projectIds) {
          await sql`
            INSERT INTO project_references (project_id, reference_id)
            VALUES (${pId}, ${reference.id})
            ON CONFLICT DO NOTHING;
          `;
        }
      }

      // Sync collections
      if (Array.isArray(reference.collectionIds)) {
        for (const cId of reference.collectionIds) {
          await sql`
            INSERT INTO collection_references (collection_id, reference_id)
            VALUES (${cId}, ${reference.id})
            ON CONFLICT DO NOTHING;
          `;
        }
      }

      sendJson(res, 200, { success: true });
      return true;
    }

    // 7. UPDATE REFERENCE
    if (pathname.startsWith('/api/references/') && req.method === 'PUT') {
      const id = pathname.replace('/api/references/', '');
      const body = await parseBody(req, 2 * 1024 * 1024);
      const { userId, updates } = body || {};

      if (!userId) {
        sendJson(res, 400, { error: 'userId obrigatório' });
        return true;
      }

      if (updates?.isFavorite !== undefined) {
        await sql`
          UPDATE "references"
          SET is_favorite = ${Boolean(updates.isFavorite)}, updated_at = now()
          WHERE id = ${id} AND user_id = ${userId};
        `;
      }

      if (updates?.title !== undefined || updates?.notesMarkdown !== undefined || updates?.palette !== undefined) {
        await sql`
          UPDATE "references"
          SET 
            title = COALESCE(${updates.title ? sanitizeString(updates.title, 255) : null}, title),
            notes_markdown = COALESCE(${updates.notesMarkdown}, notes_markdown),
            url = COALESCE(${updates.url}, url),
            domain = COALESCE(${updates.domain}, domain),
            palette = COALESCE(${updates.palette ? JSON.stringify(updates.palette) : null}::jsonb, palette),
            updated_at = now()
          WHERE id = ${id} AND user_id = ${userId};
        `;
      }

      sendJson(res, 200, { success: true });
      return true;
    }

    // 8. DELETE REFERENCE
    if (pathname.startsWith('/api/references/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/references/', '');
      const userId = url.searchParams.get('userId');
      if (!userId) {
        sendJson(res, 400, { error: 'userId obrigatório' });
        return true;
      }

      await sql`DELETE FROM "references" WHERE id = ${id} AND user_id = ${userId};`;
      sendJson(res, 200, { success: true });
      return true;
    }

    // 9. SAVE PROJECT
    if (pathname === '/api/projects' && req.method === 'POST') {
      const { userId, project } = await parseBody(req, 512 * 1024);
      if (!userId || !project?.id || !project?.name) {
        sendJson(res, 400, { error: 'Dados do projeto incompletos.' });
        return true;
      }

      await sql`
        INSERT INTO projects (id, user_id, name, description)
        VALUES (${project.id}, ${userId}, ${sanitizeString(project.name, 120)}, ${project.description ? sanitizeString(project.description, 500) : null})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          updated_at = now();
      `;
      sendJson(res, 200, { success: true });
      return true;
    }

    // 10. DELETE PROJECT
    if (pathname.startsWith('/api/projects/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/projects/', '');
      const userId = url.searchParams.get('userId');
      if (!userId) {
        sendJson(res, 400, { error: 'userId obrigatório' });
        return true;
      }
      await sql`DELETE FROM projects WHERE id = ${id} AND user_id = ${userId};`;
      sendJson(res, 200, { success: true });
      return true;
    }

    // 11. SAVE COLLECTION
    if (pathname === '/api/collections' && req.method === 'POST') {
      const { userId, collection } = await parseBody(req, 512 * 1024);
      if (!userId || !collection?.id || !collection?.name) {
        sendJson(res, 400, { error: 'Dados da coleção incompletos.' });
        return true;
      }

      await sql`
        INSERT INTO collections (id, user_id, name, description)
        VALUES (${collection.id}, ${userId}, ${sanitizeString(collection.name, 120)}, ${collection.description ? sanitizeString(collection.description, 500) : null})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          updated_at = now();
      `;
      sendJson(res, 200, { success: true });
      return true;
    }

    // 12. DELETE COLLECTION
    if (pathname.startsWith('/api/collections/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/collections/', '');
      const userId = url.searchParams.get('userId');
      if (!userId) {
        sendJson(res, 400, { error: 'userId obrigatório' });
        return true;
      }
      await sql`DELETE FROM collections WHERE id = ${id} AND user_id = ${userId};`;
      sendJson(res, 200, { success: true });
      return true;
    }

    // 13. FILE UPLOAD (Persisted directly as cloud-ready Data URI in Neon PostgreSQL)
    if (pathname === '/api/upload' && req.method === 'POST') {
      const body = await parseBody(req, 15 * 1024 * 1024);
      const { fileName, base64Data } = body || {};
      if (!base64Data) {
        sendJson(res, 400, { error: 'Dados da imagem ausentes' });
        return true;
      }

      sendJson(res, 200, {
        url: base64Data,
        storagePath: fileName ? sanitizeString(fileName, 120) : `img-${Date.now()}`,
      });
      return true;
    }

    // 14. BULK OPERATIONS
    if (pathname === '/api/bulk' && req.method === 'POST') {
      const body = await parseBody(req, 1024 * 1024);
      const { userId, action, ids, payload } = body || {};
      if (!userId || !Array.isArray(ids) || ids.length === 0) {
        sendJson(res, 200, { successCount: 0 });
        return true;
      }

      if (action === 'delete') {
        for (const id of ids) {
          await sql`DELETE FROM "references" WHERE id = ${id} AND user_id = ${userId};`;
        }
      } else if (action === 'favorite') {
        for (const id of ids) {
          await sql`
            UPDATE "references" SET is_favorite = ${Boolean(payload?.isFavorite)}, updated_at = now()
            WHERE id = ${id} AND user_id = ${userId};
          `;
        }
      }

      sendJson(res, 200, { successCount: ids.length, failedCount: 0 });
      return true;
    }

    sendJson(res, 404, { error: 'Rota não encontrada' });
    return true;
  } catch (err: any) {
    if (err.message === 'PAYLOAD_TOO_LARGE') {
      sendJson(res, 413, { error: 'O tamanho da requisição excede o limite permitido (Payload Too Large).' });
      return true;
    }
    console.error('API Error:', err);
    sendJson(res, 500, { error: err.message || 'Erro interno no servidor' });
    return true;
  }
}

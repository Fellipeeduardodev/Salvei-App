/**
 * In-memory sliding-window Rate Limiter for Salvei API.
 * High-performance, zero external dependencies, thread-safe for Node/Vercel serverless instances.
 * Automatically cleans up expired windows to prevent memory leaks.
 */

export interface RateLimitConfig {
  windowMs: number; // Duration of sliding window in milliseconds
  max: number;      // Maximum allowed requests within the window
  message?: string; // Human-readable error message
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  totalLimit: number;
  resetMs: number;      // Milliseconds until the oldest request in window expires
  retryAfterSec: number; // Seconds to wait (for Retry-After header)
  message?: string;
}

interface WindowRecord {
  timestamps: number[];
  lastAccessed: number;
}

export class SlidingWindowRateLimiter {
  private store = new Map<string, WindowRecord>();
  private pruneIntervalMs = 2 * 60 * 1000; // 2 minutes
  private lastPruneTime = Date.now();
  private maxStoreSize = 5000;

  constructor(pruneIntervalMs?: number) {
    if (pruneIntervalMs) {
      this.pruneIntervalMs = pruneIntervalMs;
    }
  }

  /**
   * Consume 1 hit from the rate limiter if allowed.
   */
  public consume(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    this.maybePrune(now);

    let record = this.store.get(key);
    if (!record) {
      record = { timestamps: [], lastAccessed: now };
      this.store.set(key, record);
    }

    record.lastAccessed = now;

    // Filter out timestamps outside current sliding window
    const windowStart = now - config.windowMs;
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= config.max) {
      const oldest = record.timestamps[0] || (now - config.windowMs);
      const resetMs = Math.max(0, oldest + config.windowMs - now);
      const retryAfterSec = Math.max(1, Math.ceil(resetMs / 1000));

      return {
        allowed: false,
        remaining: 0,
        totalLimit: config.max,
        resetMs,
        retryAfterSec,
        message: config.message || `Limite de requisições excedido. Tente novamente em ${retryAfterSec} segundos.`,
      };
    }

    // Record this hit
    record.timestamps.push(now);
    const remaining = Math.max(0, config.max - record.timestamps.length);
    const oldest = record.timestamps[0];
    const resetMs = Math.max(0, oldest + config.windowMs - now);
    const retryAfterSec = Math.max(1, Math.ceil(resetMs / 1000));

    return {
      allowed: true,
      remaining,
      totalLimit: config.max,
      resetMs,
      retryAfterSec,
    };
  }

  /**
   * Check rate limit without consuming a hit.
   */
  public check(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    this.maybePrune(now);

    const record = this.store.get(key);
    if (!record) {
      return {
        allowed: true,
        remaining: config.max,
        totalLimit: config.max,
        resetMs: 0,
        retryAfterSec: 0,
      };
    }

    const windowStart = now - config.windowMs;
    const validTimestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (validTimestamps.length >= config.max) {
      const oldest = validTimestamps[0] || (now - config.windowMs);
      const resetMs = Math.max(0, oldest + config.windowMs - now);
      const retryAfterSec = Math.max(1, Math.ceil(resetMs / 1000));

      return {
        allowed: false,
        remaining: 0,
        totalLimit: config.max,
        resetMs,
        retryAfterSec,
        message: config.message || `Limite de requisições excedido. Tente novamente em ${retryAfterSec} segundos.`,
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, config.max - validTimestamps.length),
      totalLimit: config.max,
      resetMs: 0,
      retryAfterSec: 0,
    };
  }

  /**
   * Reset hits for a specific key (e.g. after a successful password verification).
   */
  public reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all records (useful for testing or cache reset).
   */
  public clear(): void {
    this.store.clear();
  }

  /**
   * Get total number of tracked keys.
   */
  public size(): number {
    return this.store.size;
  }

  /**
   * Garbage collects stale entries whose newest hits are older than 1 hour.
   */
  private maybePrune(now: number): void {
    if (now - this.lastPruneTime < this.pruneIntervalMs && this.store.size < this.maxStoreSize) {
      return;
    }

    this.lastPruneTime = now;
    const maxRetentionMs = 60 * 60 * 1000; // 1 hour max retention

    for (const [key, record] of this.store.entries()) {
      if (now - record.lastAccessed > maxRetentionMs || record.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }
}

// Global Singleton instance for request routing
export const globalRateLimiter = new SlidingWindowRateLimiter();

/**
 * Standard security rate limit policies.
 */
export const RATE_LIMIT_POLICIES = {
  // Login: Max 5 failed attempts per (IP + Email) within 15 minutes
  LOGIN_PER_ACCOUNT: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Muitas tentativas incorretas para esta conta. Por favor, aguarde 15 minutos antes de tentar novamente.',
  },
  // Login: Max 20 attempts per IP within 15 minutes (protects against credential stuffing across multiple emails)
  LOGIN_PER_IP: {
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Muitas tentativas de autenticação a partir desta rede. Por favor, aguarde alguns minutos.',
  },
  // Forgot Password: Max 3 requests per target Email within 15 minutes (prevents inbox spam & Resend quota depletion)
  FORGOT_PASSWORD_PER_EMAIL: {
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: 'Muitas solicitações de recuperação para este e-mail. Por favor, verifique sua caixa de entrada ou aguarde 15 minutos.',
  },
  // Forgot Password: Max 10 requests per IP within 15 minutes
  FORGOT_PASSWORD_PER_IP: {
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Limite de solicitações de redefinição excedido. Por favor, aguarde 15 minutos.',
  },
  // Reset Password (token consumption): Max 10 attempts per IP within 15 minutes
  RESET_PASSWORD_PER_IP: {
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Muitas tentativas de redefinição de senha. Por favor, aguarde 15 minutos.',
  },
  // Signup: Max 5 new accounts per hour per IP (prevents bot account creation flooding)
  SIGNUP_PER_IP: {
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: 'Limite de criação de contas atingido para este endereço IP. Tente novamente mais tarde.',
  },
  // Test Email: Max 3 sends per hour per IP
  EMAIL_TEST_PER_IP: {
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Limite de testes de e-mail excedido. Aguarde 1 hora.',
  },
  // General API endpoints: Max 120 requests per minute per IP
  GLOBAL_API_PER_IP: {
    windowMs: 60 * 1000,
    max: 120,
    message: 'Muitas requisições ao servidor. Por favor, reduza a frequência.',
  },
};

/**
 * Extracts client IP address safely from Vercel / Node HTTP request.
 */
export function getClientIp(req: any): string {
  if (!req) return '127.0.0.1';

  // 1. Check standard reverse proxy headers
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const clientIp = forwarded.split(',')[0].trim();
    if (clientIp) return clientIp;
  }

  const realIp = req.headers?.['x-real-ip'];
  if (typeof realIp === 'string' && realIp.length > 0) {
    return realIp.trim();
  }

  // 2. Direct socket address (development / node server)
  const socketIp = req.socket?.remoteAddress || req.connection?.remoteAddress;
  if (typeof socketIp === 'string' && socketIp.length > 0) {
    // Strip IPv6-mapped IPv4 prefix (e.g. ::ffff:127.0.0.1 -> 127.0.0.1)
    return socketIp.replace(/^::ffff:/, '');
  }

  return '127.0.0.1';
}

/**
 * Generates standard HTTP RateLimit headers for responses.
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.totalLimit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil((Date.now() + result.resetMs) / 1000)),
  };

  if (!result.allowed) {
    headers['Retry-After'] = String(result.retryAfterSec);
  }

  return headers;
}

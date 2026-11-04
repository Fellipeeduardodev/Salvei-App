import path from 'node:path';

// Pre-computed constant valid salt:hash format to prevent timing attacks when user does not exist
export const DUMMY_PASSWORD_HASH =
  'e3b0c44298fc1c149afbf4c8996fb924:' +
  'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e' +
  '222c65c2f1074bf6ecf8e0f60a77f638b36cb59435be51f0da938f4208a0d0d8';

/**
 * Validates email according to RFC 5322 simplified standard.
 * Enforces length constraints (max 254 chars per RFC 5321).
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 3 || trimmed.length > 254) return false;

  // Disallow common injection or invalid characters
  if (trimmed.includes(' ') || trimmed.includes('\n') || trimmed.includes('\r')) {
    return false;
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Validates password length and format.
 * Enforces a maximum length of 128 characters to protect against CPU exhaustion DoS (scrypt).
 */
export function validatePassword(password: unknown): { valid: boolean; error?: string } {
  if (typeof password !== 'string') {
    return { valid: false, error: 'A senha deve ser um texto válido.' };
  }

  if (password.length < 6) {
    return { valid: false, error: 'A senha deve conter no mínimo 6 caracteres.' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'A senha excede o limite máximo permitido de 128 caracteres.' };
  }

  return { valid: true };
}

/**
 * Sanitizes generic user text (e.g. full names) against control characters and length exploits.
 */
export function sanitizeString(val: unknown, maxLength: number = 100): string {
  if (typeof val !== 'string') return '';
  // Remove ASCII control characters (0x00 - 0x1F) except standard whitespace
  const sanitized = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return sanitized.trim().slice(0, maxLength);
}

/**
 * Path traversal guard: ensures resolved file path stays strictly within allowed base directory.
 */
export function safeResolveUploadPath(
  baseDir: string,
  userSubPath: string
): { safe: boolean; resolvedPath: string } {
  // Strip null bytes and normalize URL encoded slashes
  const cleanSub = userSubPath.replace(/\0/g, '').replace(/%2e/gi, '.').replace(/%2f/gi, '/');
  const normalizedBase = path.resolve(baseDir);
  const resolved = path.resolve(normalizedBase, cleanSub.replace(/^[/\\]+/, ''));

  // Ensure target path strictly starts with baseDir + separator
  const isSafe = resolved.startsWith(normalizedBase + path.sep) || resolved === normalizedBase;
  return { safe: isSafe, resolvedPath: resolved };
}

/**
 * Returns standard OWASP HTTP security headers.
 */
export function getStandardSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  };
}

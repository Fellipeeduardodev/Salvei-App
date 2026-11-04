import { describe, it, expect, vi } from 'vitest';
import { generateResetToken, verifyResetToken } from '../../api/_neonHandler';
import { getFromEmail, getAppBaseUrl, sendWelcomeEmail, sendPasswordResetEmail, sendTestEmail } from '../../api/_emailService';

describe('Resend Email Service & Auth Tokens', () => {
  it('default sender email belongs to verified domain salvei.tech', () => {
    const from = getFromEmail();
    expect(from).toContain('@salvei.tech');
    expect(from).toContain('Salvei');
  });

  it('default application base URL is https://salvei.tech', () => {
    const url = getAppBaseUrl();
    expect(url).toMatch(/^https?:\/\//);
    expect(url).toContain('salvei.tech');
  });

  it('generates a valid reset token and verifies it successfully', () => {
    const userId = 'user-123456';
    const pwdHash = 'salt123:hash456';
    const token = generateResetToken(userId, pwdHash);

    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const check = verifyResetToken(token, pwdHash);
    expect(check.valid).toBe(true);
    expect(check.userId).toBe(userId);
  });

  it('invalidates reset token when user password changes', () => {
    const userId = 'user-123456';
    const originalHash = 'salt123:hash456';
    const token = generateResetToken(userId, originalHash);

    const newHash = 'salt999:hash999';
    const check = verifyResetToken(token, newHash);
    expect(check.valid).toBe(false);
  });

  it('rejects tampered or malformed reset tokens', () => {
    const pwdHash = 'salt123:hash456';
    expect(verifyResetToken('malformed-token', pwdHash).valid).toBe(false);
    expect(verifyResetToken('a:b:c', pwdHash).valid).toBe(false);
    expect(verifyResetToken('', pwdHash).valid).toBe(false);
  });

  it('handles missing RESEND_API_KEY gracefully without throwing unhandled exceptions', async () => {
    // Should return failure object with descriptive message instead of throwing
    const welcome = await sendWelcomeEmail('test@example.com', 'Teste');
    expect(welcome.success).toBe(false);

    const reset = await sendPasswordResetEmail('test@example.com', 'https://salvei.tech/reset?token=abc');
    expect(reset.success).toBe(false);

    const testResult = await sendTestEmail('test@example.com');
    expect(testResult.success).toBe(false);
  });
});

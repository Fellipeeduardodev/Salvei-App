import { describe, it, expect, vi } from 'vitest';
import loginHandler from '../../api/auth/login';
import indexHandler from '../../api/index';

describe('Vercel API Handlers', () => {
  it('direct login handler responds with 400 when missing credentials', async () => {
    let statusCode = 0;
    let headers: Record<string, string> = {};
    let responseBody = '';

    const req = {
      method: 'POST',
      url: '/api/auth/login',
      headers: { host: 'localhost:3000' },
      body: { email: '', password: '' },
    };

    const res = {
      set statusCode(code: number) { statusCode = code; },
      get statusCode() { return statusCode; },
      setHeader(name: string, value: string) { headers[name] = value; },
      end(data: string) { responseBody = data; },
      get writableEnded() { return Boolean(responseBody); },
    };

    await loginHandler(req, res);
    expect(statusCode).toBe(400);
    const parsed = JSON.parse(responseBody);
    expect(parsed.error).toContain('obrigatórios');
  });

  it('index catch-all handles rewritten ?path=auth/login correctly', async () => {
    let statusCode = 0;
    let headers: Record<string, string> = {};
    let responseBody = '';

    const req = {
      method: 'POST',
      url: '/api/index?path=auth/login',
      headers: { host: 'localhost:3000' },
      body: { email: '', password: '' },
    };

    const res = {
      set statusCode(code: number) { statusCode = code; },
      get statusCode() { return statusCode; },
      setHeader(name: string, value: string) { headers[name] = value; },
      end(data: string) { responseBody = data; },
      get writableEnded() { return Boolean(responseBody); },
    };

    await indexHandler(req, res);
    expect(statusCode).toBe(400);
    const parsed = JSON.parse(responseBody);
    expect(parsed.error).toContain('obrigatórios');
  });

  it('authenticates admin@admin.com with valid credentials', async () => {
    let statusCode = 0;
    let headers: Record<string, string> = {};
    let responseBody = '';

    const req = {
      method: 'POST',
      url: '/api/auth/login',
      headers: { host: 'localhost:3000' },
      body: { email: 'admin@admin.com', password: 'adm123' },
    };

    const res = {
      set statusCode(code: number) { statusCode = code; },
      get statusCode() { return statusCode; },
      setHeader(name: string, value: string) { headers[name] = value; },
      end(data: string) { responseBody = data; },
      get writableEnded() { return Boolean(responseBody); },
    };

    await loginHandler(req, res);
    expect(statusCode).toBe(200);
    const parsed = JSON.parse(responseBody);
    expect(parsed.user.email).toBe('admin@admin.com');
    expect(parsed.session.access_token).toBeDefined();
  });

  it('rejects admin@admin.com with invalid password gracefully with 401 JSON', async () => {
    let statusCode = 0;
    let headers: Record<string, string> = {};
    let responseBody = '';

    const req = {
      method: 'POST',
      url: '/api/auth/login',
      headers: { host: 'localhost:3000' },
      body: { email: 'admin@admin.com', password: 'wrongpassword' },
    };

    const res = {
      set statusCode(code: number) { statusCode = code; },
      get statusCode() { return statusCode; },
      setHeader(name: string, value: string) { headers[name] = value; },
      end(data: string) { responseBody = data; },
      get writableEnded() { return Boolean(responseBody); },
    };

    await loginHandler(req, res);
    expect(statusCode).toBe(401);
    const parsed = JSON.parse(responseBody);
    expect(parsed.error).toBe('E-mail ou senha incorretos.');
  });
});

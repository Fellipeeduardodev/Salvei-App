import { describe, it, expect, beforeEach } from 'vitest';
import indexHandler from '../../api/index';
import {
  SlidingWindowRateLimiter,
  globalRateLimiter,
  RATE_LIMIT_POLICIES,
  getClientIp,
  getRateLimitHeaders,
} from '../../api/_rateLimiter';
import {
  isValidEmail,
  validatePassword,
  sanitizeString,
  safeResolveUploadPath,
  DUMMY_PASSWORD_HASH,
  getStandardSecurityHeaders,
} from '../../api/_security';

// Helper to simulate Node/Vercel HTTP request and response
function createMockHttp(reqOptions: {
  method?: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
}) {
  let statusCode = 200;
  let headers: Record<string, string> = {};
  let responseBody = '';

  const req = {
    method: reqOptions.method || 'GET',
    url: reqOptions.url,
    headers: { host: 'localhost:3000', ...(reqOptions.headers || {}) },
    body: reqOptions.body,
  };

  const res = {
    set statusCode(code: number) {
      statusCode = code;
    },
    get statusCode() {
      return statusCode;
    },
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value;
    },
    getHeader(name: string) {
      return headers[name.toLowerCase()];
    },
    writeHead(code: number, hdrs?: Record<string, string>) {
      statusCode = code;
      if (hdrs) {
        for (const [k, v] of Object.entries(hdrs)) {
          headers[k.toLowerCase()] = v;
        }
      }
    },
    end(data?: string) {
      if (data) responseBody = data;
    },
    get writableEnded() {
      return Boolean(responseBody);
    },
  };

  return { req, res, getStatusCode: () => statusCode, getHeaders: () => headers, getBody: () => responseBody };
}

describe('Salvei — Arquitetura de Segurança e Rate Limiting', () => {
  beforeEach(() => {
    globalRateLimiter.clear();
  });

  describe('1. Sliding Window Rate Limiter Engine', () => {
    it('permite requisições dentro do limite configurado', () => {
      const limiter = new SlidingWindowRateLimiter();
      const config = { windowMs: 1000, max: 3 };

      const res1 = limiter.consume('user-1', config);
      expect(res1.allowed).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = limiter.consume('user-1', config);
      expect(res2.allowed).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = limiter.consume('user-1', config);
      expect(res3.allowed).toBe(true);
      expect(res3.remaining).toBe(0);
    });

    it('bloqueia requisições quando o limite é excedido e calcula retryAfterSec', () => {
      const limiter = new SlidingWindowRateLimiter();
      const config = { windowMs: 60 * 1000, max: 2, message: 'Limite atingido' };

      limiter.consume('user-block', config);
      limiter.consume('user-block', config);

      const blocked = limiter.consume('user-block', config);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
      expect(blocked.retryAfterSec).toBeLessThanOrEqual(60);
      expect(blocked.message).toBe('Limite atingido');
    });

    it('isola limites entre chaves distintas', () => {
      const limiter = new SlidingWindowRateLimiter();
      const config = { windowMs: 1000, max: 1 };

      const u1 = limiter.consume('ip-1', config);
      const u2 = limiter.consume('ip-2', config);

      expect(u1.allowed).toBe(true);
      expect(u2.allowed).toBe(true);

      const u1Next = limiter.consume('ip-1', config);
      expect(u1Next.allowed).toBe(false);
    });

    it('permite reset manual de contador de tentativas (ex: após login com sucesso)', () => {
      const limiter = new SlidingWindowRateLimiter();
      const config = { windowMs: 10000, max: 2 };

      limiter.consume('account-1', config);
      limiter.consume('account-1', config);
      expect(limiter.check('account-1', config).allowed).toBe(false);

      limiter.reset('account-1');
      expect(limiter.check('account-1', config).allowed).toBe(true);
      expect(limiter.consume('account-1', config).allowed).toBe(true);
    });

    it('gera cabeçalhos HTTP de RateLimit compatíveis com os padrões da IETF', () => {
      const limiter = new SlidingWindowRateLimiter();
      const config = { windowMs: 30000, max: 5 };

      limiter.consume('client-ip', config);
      const res = limiter.consume('client-ip', config);
      const headers = getRateLimitHeaders(res);

      expect(headers['X-RateLimit-Limit']).toBe('5');
      expect(headers['X-RateLimit-Remaining']).toBe('3');
      expect(headers['X-RateLimit-Reset']).toBeDefined();
      expect(headers['Retry-After']).toBeUndefined();

      // Consome até bloquear
      limiter.consume('client-ip', config);
      limiter.consume('client-ip', config);
      limiter.consume('client-ip', config);
      const blockedRes = limiter.consume('client-ip', config);
      const blockedHeaders = getRateLimitHeaders(blockedRes);

      expect(blockedHeaders['Retry-After']).toBeDefined();
      expect(Number(blockedHeaders['Retry-After'])).toBeGreaterThanOrEqual(1);
    });
  });

  describe('2. Sanitização, Validação e Detecção de Injeção', () => {
    it('valida formatos de e-mail e rejeita payloads maliciosos', () => {
      expect(isValidEmail('usuario@salvei.tech')).toBe(true);
      expect(isValidEmail('design.lead@estudio.com.br')).toBe(true);

      // E-mails inválidos ou vetores de injeção
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('sem-arroba.com')).toBe(false);
      expect(isValidEmail('admin@')).toBe(false);
      expect(isValidEmail('test@com')).toBe(false);
      expect(isValidEmail('attacker@domain.com\r\nBcc: victim@domain.com')).toBe(false);
      expect(isValidEmail('user with space@domain.com')).toBe(false);
      expect(isValidEmail('a'.repeat(260) + '@domain.com')).toBe(false); // Excede RFC 5321 (254 chars)
    });

    it('valida limites de tamanho de senha para prevenir DoS por exaustão de CPU (scrypt)', () => {
      expect(validatePassword('123456').valid).toBe(true);
      expect(validatePassword('uma_senha_super_segura_2026').valid).toBe(true);

      // Senhas muito curtas
      const short = validatePassword('12345');
      expect(short.valid).toBe(false);
      expect(short.error).toContain('mínimo 6 caracteres');

      // Senha gigante (> 128 chars) tentando exaurir CPU do scrypt
      const hugePassword = 'A'.repeat(500);
      const huge = validatePassword(hugePassword);
      expect(huge.valid).toBe(false);
      expect(huge.error).toContain('128 caracteres');

      // Tipos inválidos
      expect(validatePassword(null).valid).toBe(false);
    });

    it('sanitiza strings de entrada removendo caracteres de controle', () => {
      const malicious = 'João\x00\x08 Silva\x1F Designer';
      const clean = sanitizeString(malicious, 50);
      expect(clean).toBe('João Silva Designer');

      const truncated = sanitizeString('A'.repeat(200), 50);
      expect(truncated.length).toBe(50);
    });

    it('previne ataques de Directory/Path Traversal (CWE-22)', () => {
      const baseUploads = 'C:\\Users\\Curator\\public\\uploads';

      // Caminhos seguros
      const safe1 = safeResolveUploadPath(baseUploads, 'photo-1.png');
      expect(safe1.safe).toBe(true);
      expect(safe1.resolvedPath).toContain('photo-1.png');

      const safe2 = safeResolveUploadPath(baseUploads, 'subfolder/avatar.webp');
      expect(safe2.safe).toBe(true);

      // Tentativas de Path Traversal para vazar .env.local ou arquivos do sistema
      const attack1 = safeResolveUploadPath(baseUploads, '../../.env.local');
      expect(attack1.safe).toBe(false);

      const attack2 = safeResolveUploadPath(baseUploads, '..\\..\\package.json');
      expect(attack2.safe).toBe(false);

      const attack3 = safeResolveUploadPath(baseUploads, '%2e%2e/%2e%2e/.env.local');
      expect(attack3.safe).toBe(false);

      const attack4 = safeResolveUploadPath(baseUploads, '/../../../../windows/system32');
      expect(attack4.safe).toBe(false);
    });

    it('extrai IP real do cliente mesmo através de múltiplos proxies/CDNs', () => {
      const mockReqForwarded = {
        headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178' },
      };
      expect(getClientIp(mockReqForwarded)).toBe('203.0.113.195');

      const mockReqRealIp = {
        headers: { 'x-real-ip': '198.51.100.42' },
      };
      expect(getClientIp(mockReqRealIp)).toBe('198.51.100.42');

      const mockReqSocket = {
        headers: {},
        socket: { remoteAddress: '::ffff:192.168.1.100' },
      };
      expect(getClientIp(mockReqSocket)).toBe('192.168.1.100');
    });
  });

  describe('3. Proteção contra Ataques de Brute Force (Endpoints de Autenticação)', () => {
    it('bloqueia força bruta de senha no login após 5 tentativas incorretas (HTTP 429)', async () => {
      const targetEmail = 'alvo_seguranca@salvei.tech';
      const attackerIp = '185.220.101.5';

      // Executa 5 tentativas de senha errada
      for (let attempt = 1; attempt <= 5; attempt++) {
        const { req, res, getStatusCode, getBody } = createMockHttp({
          method: 'POST',
          url: '/api/auth/login',
          headers: { 'x-forwarded-for': attackerIp },
          body: { email: targetEmail, password: `senha_errada_${attempt}` },
        });

        await indexHandler(req, res);
        expect(getStatusCode()).toBe(401);
        const body = JSON.parse(getBody());
        expect(body.error).toBe('E-mail ou senha incorretos.');
      }

      // A 6ª tentativa deve ser terminantemente bloqueada com HTTP 429 Too Many Requests
      const { req, res, getStatusCode, getHeaders, getBody } = createMockHttp({
        method: 'POST',
        url: '/api/auth/login',
        headers: { 'x-forwarded-for': attackerIp },
        body: { email: targetEmail, password: 'qualquer_outra_senha' },
      });

      await indexHandler(req, res);
      expect(getStatusCode()).toBe(429);
      expect(getHeaders()['retry-after']).toBeDefined();
      expect(getHeaders()['x-ratelimit-remaining']).toBe('0');

      const body = JSON.parse(getBody());
      expect(body.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(body.error).toContain('Muitas tentativas incorretas para esta conta');
    });

    it('limpa o contador de tentativas quando o login é autenticado com sucesso', async () => {
      const email = 'admin@admin.com';
      const ip = '192.168.1.50';

      // 2 tentativas com senha errada
      for (let i = 0; i < 2; i++) {
        const { req, res, getStatusCode } = createMockHttp({
          method: 'POST',
          url: '/api/auth/login',
          headers: { 'x-forwarded-for': ip },
          body: { email, password: 'senha_incorreta' },
        });
        await indexHandler(req, res);
        expect(getStatusCode()).toBe(401);
      }

      // Agora faz login com a senha correta (adm123)
      const { req: okReq, res: okRes, getStatusCode: getOkStatus } = createMockHttp({
        method: 'POST',
        url: '/api/auth/login',
        headers: { 'x-forwarded-for': ip },
        body: { email, password: 'adm123' },
      });
      await indexHandler(okReq, okRes);
      expect(getOkStatus()).toBe(200);

      // O contador da conta deve ter sido resetado!
      const checkResult = globalRateLimiter.check(`login_acc:${ip}:${email}`, RATE_LIMIT_POLICIES.LOGIN_PER_ACCOUNT);
      expect(checkResult.remaining).toBe(RATE_LIMIT_POLICIES.LOGIN_PER_ACCOUNT.max);
    });

    it('bloqueia Credential Stuffing (IP atacando múltiplos e-mails simultâneos)', async () => {
      const botnetIp = '45.33.32.156';

      // O limite de IP para login é 20 tentativas dentro de 15 minutos
      for (let i = 1; i <= 20; i++) {
        const { req, res, getStatusCode } = createMockHttp({
          method: 'POST',
          url: '/api/auth/login',
          headers: { 'x-forwarded-for': botnetIp },
          body: { email: `user${i}@empresa.com`, password: 'password123' },
        });
        await indexHandler(req, res);
        expect(getStatusCode()).toBe(401);
      }

      // A 21ª tentativa a partir do mesmo IP deve ser barrada pelo limite global de IP
      const { req, res, getStatusCode, getBody } = createMockHttp({
        method: 'POST',
        url: '/api/auth/login',
        headers: { 'x-forwarded-for': botnetIp },
        body: { email: 'another_user@empresa.com', password: 'password123' },
      });

      await indexHandler(req, res);
      expect(getStatusCode()).toBe(429);
      const body = JSON.parse(getBody());
      expect(body.error).toContain('Muitas tentativas de autenticação a partir desta rede');
    });

    it('protege contra bombardeio de e-mail e spam em forgot-password (limite por e-mail e por IP)', async () => {
      const victimEmail = 'vitima_spam@salvei.tech';
      const ip = '104.244.42.1';

      // FORGOT_PASSWORD_PER_EMAIL permite no máximo 3 solicitações por 15 minutos
      for (let i = 1; i <= 3; i++) {
        const { req, res, getStatusCode, getBody } = createMockHttp({
          method: 'POST',
          url: '/api/auth/forgot-password',
          headers: { 'x-forwarded-for': ip },
          body: { email: victimEmail },
        });
        await indexHandler(req, res);
        expect(getStatusCode()).toBe(200);
        const body = JSON.parse(getBody());
        expect(body.success).toBe(true);
      }

      // 4ª tentativa para o mesmo e-mail é bloqueada com 429
      const { req, res, getStatusCode, getBody } = createMockHttp({
        method: 'POST',
        url: '/api/auth/forgot-password',
        headers: { 'x-forwarded-for': ip },
        body: { email: victimEmail },
      });
      await indexHandler(req, res);
      expect(getStatusCode()).toBe(429);
      const body = JSON.parse(getBody());
      expect(body.error).toContain('Muitas solicitações de recuperação para este e-mail');
    });

    it('protege criação massiva de contas (botnet signup flood) limitando por IP', async () => {
      const spammerIp = '198.51.100.99';

      // SIGNUP_PER_IP permite no máximo 5 contas por hora por IP
      for (let i = 1; i <= 5; i++) {
        const { req, res, getStatusCode } = createMockHttp({
          method: 'POST',
          url: '/api/auth/signup',
          headers: { 'x-forwarded-for': spammerIp },
          body: {
            email: `novo_usuario_${Date.now()}_${i}@salvei.tech`,
            password: 'validPassword123!',
            fullName: `Usuário ${i}`,
          },
        });
        await indexHandler(req, res);
        // Pode ser 200 (sucesso) ou 400 se já cadastrado, mas não 429
        expect(getStatusCode()).not.toBe(429);
      }

      // A 6ª criação de conta a partir do mesmo IP dentro de 1h é bloqueada
      const { req, res, getStatusCode, getBody } = createMockHttp({
        method: 'POST',
        url: '/api/auth/signup',
        headers: { 'x-forwarded-for': spammerIp },
        body: {
          email: `outro_usuario_${Date.now()}@salvei.tech`,
          password: 'validPassword123!',
          fullName: 'Robô Spammer',
        },
      });

      await indexHandler(req, res);
      expect(getStatusCode()).toBe(429);
      const body = JSON.parse(getBody());
      expect(body.error).toContain('Limite de criação de contas atingido');
    });

    it('rejeita senhas gigantes no signup/login para evitar CPU DoS antes da criptografia', async () => {
      const { req, res, getStatusCode, getBody } = createMockHttp({
        method: 'POST',
        url: '/api/auth/signup',
        body: {
          email: 'teste_cpu_dos@salvei.tech',
          password: 'B'.repeat(300), // Excede limite de 128
          fullName: 'Tester',
        },
      });

      await indexHandler(req, res);
      expect(getStatusCode()).toBe(400);
      const body = JSON.parse(getBody());
      expect(body.error).toContain('128 caracteres');
    });
  });

  describe('4. Proteção contra Path Traversal e Headers de Segurança', () => {
    it('bloqueia tentativa de Path Traversal em /uploads/ com 403 Forbidden', async () => {
      const { req, res, getStatusCode, getBody } = createMockHttp({
        method: 'GET',
        url: '/uploads/../../.env.local',
      });

      await indexHandler(req, res);
      expect(getStatusCode()).toBe(403);
      const body = JSON.parse(getBody());
      expect(body.error).toContain('Acesso negado: tentativa de travessia');
    });

    it('bloqueia Path Traversal codificado por URL (%2e%2e)', async () => {
      const { req, res, getStatusCode, getBody } = createMockHttp({
        method: 'GET',
        url: '/uploads/%2e%2e/%2e%2e/package.json',
      });

      await indexHandler(req, res);
      expect(getStatusCode()).toBe(403);
    });

    it('injeta cabeçalhos de segurança OWASP em todas as respostas da API', async () => {
      const { req, res, getHeaders } = createMockHttp({
        method: 'GET',
        url: '/api/ping',
      });

      await indexHandler(req, res);
      const hdrs = getHeaders();

      expect(hdrs['x-content-type-options']).toBe('nosniff');
      expect(hdrs['x-frame-options']).toBe('DENY');
      expect(hdrs['x-xss-protection']).toBe('1; mode=block');
      expect(hdrs['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(hdrs['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
      expect(hdrs['strict-transport-security']).toContain('max-age=63072000');
    });

    it('responde requisições CORS Preflight (OPTIONS) com status 204 e cabeçalhos adequados', async () => {
      const { req, res, getStatusCode, getHeaders } = createMockHttp({
        method: 'OPTIONS',
        url: '/api/auth/login',
      });

      await indexHandler(req, res);
      expect(getStatusCode()).toBe(204);
      expect(getHeaders()['access-control-allow-origin']).toBe('*');
      expect(getHeaders()['access-control-allow-methods']).toContain('POST');
    });
  });
});

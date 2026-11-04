import { neon } from '@neondatabase/serverless';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { sendWelcomeEmail, sendPasswordResetEmail, sendTestEmail, getAppBaseUrl } from './_emailService.js';

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

// Helper to read JSON request body safely
export function parseBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return Promise.resolve(req.body);
    }
    if (typeof req.body === 'string') {
      try {
        return Promise.resolve(JSON.parse(req.body));
      } catch {
        return Promise.resolve({});
      }
    }
    if (Buffer.isBuffer(req.body)) {
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

  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export function sendJson(res: any, status: number, data: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.end(JSON.stringify(data));
}

/**
 * Main request router for Neon API endpoints.
 * Compatible with Vite dev server middleware and Vercel Serverless Function runtime.
 */
export async function handleNeonApiRequest(req: any, res: any): Promise<boolean> {
  const host = req.headers?.host || 'localhost';
  const rawUrl = req.url || '/';
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

  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    sendJson(res, 500, {
      error: 'DATABASE_URL não configurada no servidor Vercel. Adicione a variável de ambiente no painel do projeto na Vercel.',
    });
    return true;
  }

  try {
    // 1. AUTH: LOGIN
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = await parseBody(req);
      if (!email || !password) {
        sendJson(res, 400, { error: 'E-mail e senha são obrigatórios.' });
        return true;
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const users = await sql`
        SELECT u.id, u.email, u.full_name, u.password_hash, p.avatar_url, p.onboarding_completed, p.preferences
        FROM users u
        LEFT JOIN profiles p ON p.id = u.id
        WHERE LOWER(u.email) = ${cleanEmail}
        LIMIT 1;
      `;

      if (users.length === 0) {
        sendJson(res, 401, { error: 'E-mail ou senha incorretos.' });
        return true;
      }

      const user = users[0];
      const isValidPassword = verifyPassword(String(password), user.password_hash);
      if (!isValidPassword) {
        sendJson(res, 401, { error: 'E-mail ou senha incorretos.' });
        return true;
      }

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

    // 2. AUTH: SIGNUP
    if ((pathname === '/api/auth/signup' || pathname === '/api/auth/register') && req.method === 'POST') {
      const { email, password, fullName } = await parseBody(req);
      if (!email || !password) {
        sendJson(res, 400, { error: 'E-mail e senha são obrigatórios.' });
        return true;
      }
      if (String(password).length < 6) {
        sendJson(res, 400, { error: 'A senha deve conter no mínimo 6 caracteres.' });
        return true;
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const cleanName = String(fullName || cleanEmail.split('@')[0]).trim();

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

      // Envio de boas-vindas assíncrono via Resend (não bloqueia a resposta da API)
      sendWelcomeEmail(cleanEmail, cleanName).catch((err) => {
        console.warn('[Resend] Falha ao enviar e-mail de boas-vindas:', err);
      });

      return true;
    }

    // 2.1 AUTH: FORGOT PASSWORD
    if (pathname === '/api/auth/forgot-password' && req.method === 'POST') {
      const { email } = await parseBody(req);
      if (!email) {
        sendJson(res, 400, { error: 'E-mail é obrigatório.' });
        return true;
      }

      const cleanEmail = String(email).trim().toLowerCase();
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

    // 2.2 AUTH: RESET PASSWORD
    if (pathname === '/api/auth/reset-password' && req.method === 'POST') {
      const { token, newPassword } = await parseBody(req);
      if (!token || !newPassword) {
        sendJson(res, 400, { error: 'Token e nova senha são obrigatórios.' });
        return true;
      }
      if (String(newPassword).length < 6) {
        sendJson(res, 400, { error: 'A nova senha deve ter no mínimo 6 caracteres.' });
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

    // 2.3 EMAIL: TEST / HEALTH CHECK
    if (pathname === '/api/email/test' && (req.method === 'POST' || req.method === 'GET')) {
      const body = req.method === 'POST' ? await parseBody(req) : {};
      const targetEmail = body.to || url.searchParams.get('to');

      if (!targetEmail) {
        sendJson(res, 400, { error: 'Parâmetro "to" (destinatário) é obrigatório.' });
        return true;
      }

      const sendResult = await sendTestEmail(String(targetEmail).trim());
      if (!sendResult.success) {
        sendJson(res, 500, { error: sendResult.error || 'Falha ao enviar e-mail de teste.' });
        return true;
      }

      sendJson(res, 200, {
        success: true,
        message: `E-mail de teste enviado com sucesso para ${targetEmail}`,
        id: sendResult.id,
      });
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
      const body = await parseBody(req);
      const { userId, updates } = body;
      if (!userId) {
        sendJson(res, 400, { error: 'userId obrigatório' });
        return true;
      }

      await sql`
        UPDATE profiles
        SET 
          full_name = COALESCE(${updates.full_name}, full_name),
          avatar_url = COALESCE(${updates.avatar_url}, avatar_url),
          onboarding_completed = COALESCE(${updates.onboarding_completed}, onboarding_completed),
          preferences = COALESCE(${updates.preferences ? JSON.stringify(updates.preferences) : null}::jsonb, preferences),
          updated_at = now()
        WHERE id = ${userId};
      `;
      sendJson(res, 200, { success: true });
      return true;
    }

    // 6. SAVE / CREATE REFERENCE
    if (pathname === '/api/references' && req.method === 'POST') {
      const body = await parseBody(req);
      const { userId, reference } = body;

      await sql`
        INSERT INTO "references" (
          id, user_id, title, url, domain, screenshot_url, image_storage_path,
          screenshot_status, source_type, original_file_name, notes_markdown, is_favorite, palette
        ) VALUES (
          ${reference.id}, ${userId}, ${reference.title}, ${reference.url || null},
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
          const cleanTag = String(tag).trim();
          if (!cleanTag) continue;
          const tagId = `tag-${cleanTag.toLowerCase().replace(/\s+/g, '-')}`;
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
      const body = await parseBody(req);
      const { userId, updates } = body;

      if (updates.isFavorite !== undefined) {
        await sql`
          UPDATE "references"
          SET is_favorite = ${Boolean(updates.isFavorite)}, updated_at = now()
          WHERE id = ${id} AND user_id = ${userId};
        `;
      }

      if (updates.title !== undefined || updates.notesMarkdown !== undefined || updates.palette !== undefined) {
        await sql`
          UPDATE "references"
          SET 
            title = COALESCE(${updates.title}, title),
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
      const { userId, project } = await parseBody(req);
      await sql`
        INSERT INTO projects (id, user_id, name, description)
        VALUES (${project.id}, ${userId}, ${project.name}, ${project.description || null})
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
      await sql`DELETE FROM projects WHERE id = ${id} AND user_id = ${userId};`;
      sendJson(res, 200, { success: true });
      return true;
    }

    // 11. SAVE COLLECTION
    if (pathname === '/api/collections' && req.method === 'POST') {
      const { userId, collection } = await parseBody(req);
      await sql`
        INSERT INTO collections (id, user_id, name, description)
        VALUES (${collection.id}, ${userId}, ${collection.name}, ${collection.description || null})
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
      await sql`DELETE FROM collections WHERE id = ${id} AND user_id = ${userId};`;
      sendJson(res, 200, { success: true });
      return true;
    }

    // 13. FILE UPLOAD (Persisted directly as cloud-ready Data URI in Neon PostgreSQL)
    if (pathname === '/api/upload' && req.method === 'POST') {
      const { fileName, base64Data } = await parseBody(req);
      if (!base64Data) {
        sendJson(res, 400, { error: 'Dados da imagem ausentes' });
        return true;
      }

      sendJson(res, 200, {
        url: base64Data,
        storagePath: fileName || `img-${Date.now()}`,
      });
      return true;
    }

    // Serve legacy static /uploads/ files if requested
    if (pathname.startsWith('/uploads/') && req.method === 'GET') {
      const filePath = path.resolve(process.cwd(), 'public', pathname.replace(/^\//, ''));
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
        };
        const stream = fs.createReadStream(filePath);
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'image/png' });
        stream.pipe(res);
        return true;
      }
    }

    // 14. BULK OPERATIONS
    if (pathname === '/api/bulk' && req.method === 'POST') {
      const { userId, action, ids, payload } = await parseBody(req);
      if (!Array.isArray(ids) || ids.length === 0) {
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
            UPDATE "references" SET is_favorite = ${Boolean(payload.isFavorite)}, updated_at = now()
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
    console.error('API Error:', err);
    sendJson(res, 500, { error: err.message || 'Erro interno no servidor' });
    return true;
  }
}

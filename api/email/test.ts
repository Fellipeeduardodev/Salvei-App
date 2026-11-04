import { handleNeonApiRequest } from '../_neonHandler.js';
import { sendTestEmail } from '../_emailService.js';

export default async function handler(req: any, res: any) {
  try {
    // Normalizar req.url para garantir compatibilidade com Vercel Function routing
    if (!req.url || !req.url.includes('/api/email/test')) {
      const queryIndex = req.url ? req.url.indexOf('?') : -1;
      const queryString = queryIndex !== -1 ? req.url.substring(queryIndex) : '';
      req.url = `/api/email/test${queryString}`;
    }

    const handled = await handleNeonApiRequest(req, res);
    if (!handled && !res.writableEnded) {
      const url = new URL(req.url, 'http://localhost');
      const targetEmail = url.searchParams.get('to');
      if (!targetEmail) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Parâmetro "to" (destinatário) é obrigatório.' }));
        return;
      }
      const result = await sendTestEmail(targetEmail);
      res.statusCode = result.success ? 200 : 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result));
    }
  } catch (err: any) {
    if (!res.writableEnded) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message || 'Erro interno no servidor' }));
    }
  }
}


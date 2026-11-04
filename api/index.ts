import { handleNeonApiRequest } from './_neonHandler.js';

export default async function handler(req: any, res: any) {
  try {
    const handled = await handleNeonApiRequest(req, res);
    if (!handled && !res.writableEnded) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Endpoint não encontrado' }));
    }
  } catch (err: any) {
    if (!res.writableEnded) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message || 'Erro interno no servidor' }));
    }
  }
}

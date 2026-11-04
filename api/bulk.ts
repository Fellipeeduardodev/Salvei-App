import { handleNeonApiRequest } from '../src/server/neonHandler';

export default async function handler(req: any, res: any) {
  const handled = await handleNeonApiRequest(req, res);
  if (!handled && !res.writableEnded) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Endpoint não encontrado' }));
  }
}

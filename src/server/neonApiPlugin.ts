import type { Plugin } from 'vite';
import { handleNeonApiRequest } from './neonHandler';

export function neonApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-neon-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await handleNeonApiRequest(req, res);
        if (!handled) {
          next();
        }
      });
    },
  };
}

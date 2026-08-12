import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config';
import { ApiError } from './store';
import { authRouter } from './routes/auth';
import { ordersRouter } from './routes/orders';
import { productsRouter } from './routes/products';
import { ratesRouter } from './routes/rates';
import { statsRouter } from './routes/stats';
import { transactionsRouter } from './routes/transactions';

export function createApp(): express.Express {
  const app = express();
  app.disable('x-powered-by');

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, ts: Date.now() });
  });

  app.use('/api/auth', authRouter());
  app.use('/api/products', productsRouter());
  app.use('/api/orders', ordersRouter());
  app.use('/api/transactions', transactionsRouter());
  app.use('/api/rates', ratesRouter());
  app.use('/api/stats', statsRouter());

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
  });

  // Cliente compilado (producción): sirve la SPA y cae al index.html
  const dist = config.clientDist;
  if (fs.existsSync(path.join(dist, 'index.html'))) {
    app.use(express.static(dist));
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        res.sendFile(path.join(dist, 'index.html'));
        return;
      }
      next();
    });
  }

  // Manejador central de errores
  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (err instanceof ApiError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      const parseError = err as { type?: string };
      if (parseError.type === 'entity.parse.failed') {
        res.status(400).json({ error: 'JSON inválido en la petición' });
        return;
      }
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
    },
  );

  return app;
}

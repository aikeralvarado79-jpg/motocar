import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAdmin } from '../auth';
import { broadcast } from '../broadcast';
import { store } from '../store';

export function ratesRouter(): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.json({ rate: store.rate, history: store.listRateHistory() });
  });

  router.put('/', requireAdmin, (req: Request, res: Response) => {
    const rate = Number(req.body?.rate);
    if (!Number.isFinite(rate) || rate <= 0) {
      res.status(400).json({ error: 'Ingresa una tasa válida mayor a 0' });
      return;
    }
    const result = store.setRate(rate, res.locals.session.username);
    broadcast('rate:updated', result);
    res.json(result);
  });

  return router;
}

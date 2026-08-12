import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAdmin } from '../auth';
import { store } from '../store';
export function transactionsRouter(): Router {
  const router = Router();

  router.get('/', requireAdmin, (_req: Request, res: Response) => {
    res.json(store.listTransactions());
  });

  return router;
}

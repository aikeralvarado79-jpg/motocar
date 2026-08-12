import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  createSession,
  destroySession,
  extractToken,
  getSession,
  requireAdmin,
  verifyCredentials,
} from '../auth';

export function authRouter(): Router {
  const router = Router();

  router.post('/login', (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Debes enviar usuario y contraseña' });
      return;
    }
    if (!verifyCredentials(username, password)) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }
    const session = createSession(username);
    res.json({ token: session.token, user: { username: session.username, role: 'admin' } });
  });

  router.post('/logout', (req: Request, res: Response) => {
    destroySession(extractToken(req));
    res.json({ ok: true });
  });

  router.get('/me', requireAdmin, (_req: Request, res: Response) => {
    res.json({ user: { username: res.locals.session.username, role: 'admin' } });
  });

  return router;
}

export function isAuthenticated(req: Request): boolean {
  return getSession(extractToken(req)) !== undefined;
}

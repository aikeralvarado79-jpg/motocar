import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { config } from './config';

interface Session {
  token: string;
  username: string;
  role: 'admin';
  createdAt: number;
  expiresAt: number;
}

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const sessions = new Map<string, Session>();

function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function verifyCredentials(username: string, password: string): boolean {
  return (
    constantTimeEqual(username, config.adminUsername) &&
    constantTimeEqual(password, config.adminPassword)
  );
}

export function createSession(username: string): Session {
  const token = randomBytes(32).toString('hex');
  const now = Date.now();
  const session: Session = {
    token,
    username,
    role: 'admin',
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
  sessions.set(token, session);
  return session;
}

export function getSession(token: string | undefined): Session | undefined {
  if (!token) return undefined;
  const session = sessions.get(token);
  if (!session) return undefined;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return undefined;
  }
  return session;
}

export function destroySession(token: string | undefined): void {
  if (token) sessions.delete(token);
}

export function extractToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice('Bearer '.length).trim();
}

/** Middleware de autenticación para rutas administrativas. */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const session = getSession(extractToken(req));
  if (!session) {
    res.status(401).json({ error: 'No autorizado. Inicia sesión como administrador.' });
    return;
  }
  res.locals.session = session;
  next();
}

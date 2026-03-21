import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export type AuthUser = {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
  name?: string | null;
};

type JwtPayload = {
  sub: number;
  email: string;
  role: 'USER' | 'ADMIN';
  name?: string | null;
};

function parseJwtPayload(decoded: unknown): JwtPayload | null {
  if (!decoded || typeof decoded !== 'object') return null;
  const d = decoded as any;

  const subRaw: unknown = d.sub;
  const email: unknown = d.email;
  const role: unknown = d.role;
  const name: unknown = d.name;

  const sub = typeof subRaw === 'number' ? subRaw : typeof subRaw === 'string' ? Number(subRaw) : NaN;
  if (!Number.isFinite(sub)) return null;
  if (typeof email !== 'string' || !email) return null;
  if (role !== 'USER' && role !== 'ADMIN') return null;

  return {
    sub,
    email,
    role,
    name: typeof name === 'string' ? name : name == null ? null : String(name),
  };
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.header('authorization') || '';
    const [scheme, token] = auth.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decodedRaw = jwt.verify(token, getJwtSecret());
    const decoded = parseJwtPayload(decodedRaw);
    if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
    (req as any).user = {
      id: Number(decoded.sub),
      email: decoded.email,
      role: decoded.role,
      name: decoded.name ?? null,
    } satisfies AuthUser;

    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    const user = (req as any).user as AuthUser | undefined;
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  });
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    const user = (req as any).user as AuthUser | undefined;
    if (!user || user.role !== 'USER') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  });
}

import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma.js';

const STATE_TTL_MS = 10 * 60 * 1000;
type PendingState = { exp: number; next?: string };
const pendingStates = new Map<string, PendingState>();

function cleanupStates() {
  const now = Date.now();
  for (const [state, exp] of pendingStates.entries()) {
    if (exp.exp <= now) pendingStates.delete(state);
  }
}

function sanitizeNext(raw: unknown) {
  const v = typeof raw === 'string' ? raw : '';
  if (!v) return undefined;
  if (!v.startsWith('/')) return undefined;
  return v;
}

function getRequiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

function getOAuthClient() {
  const clientId = getRequiredEnv('GOOGLE_CLIENT_ID');
  const clientSecret = getRequiredEnv('GOOGLE_CLIENT_SECRET');
  const redirectUri = getRequiredEnv('GOOGLE_REDIRECT_URI');
  return new OAuth2Client({ clientId, clientSecret, redirectUri });
}

function getJwtSecret() {
  return getRequiredEnv('JWT_SECRET');
}

function safeEq(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || 'admin@mdfilm.md';
}

export class AuthController {
  async googleStart(req: Request, res: Response) {
    cleanupStates();

    const client = getOAuthClient();
    const state = crypto.randomBytes(16).toString('hex');
    const next = sanitizeNext(req.query.next);
    pendingStates.set(state, { exp: Date.now() + STATE_TTL_MS, next });

    const url = client.generateAuthUrl({
      access_type: 'online',
      scope: ['openid', 'email', 'profile'],
      state,
      prompt: 'select_account',
    });

    return res.redirect(url);
  }

  async googleCallback(req: Request, res: Response) {
    cleanupStates();

    const code = String(req.query.code || '');
    const state = String(req.query.state || '');
    const error = req.query.error ? String(req.query.error) : null;

    if (error) {
      return res.status(400).json({ error });
    }

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code/state' });
    }

    const st = pendingStates.get(state);
    if (!st || st.exp <= Date.now()) {
      return res.status(400).json({ error: 'Invalid state' });
    }
    pendingStates.delete(state);

    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      return res.status(400).json({ error: 'Missing id_token' });
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: getRequiredEnv('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Invalid token payload' });
    }

    const googleSub = payload.sub;
    const email = payload.email;
    const emailVerified = payload.email_verified;

    if (!googleSub || !email || !emailVerified) {
      return res.status(400).json({ error: 'Unverified Google account' });
    }

    const name = payload.name || null;
    const avatarUrl = payload.picture || null;

    const role = 'USER';

    const existing = await prisma.user.findUnique({ where: { googleSub } });
    const existingByEmail = existing ? null : await prisma.user.findUnique({ where: { email } });

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            email,
            name,
            avatarUrl,
            role,
          },
        })
      : existingByEmail
        ? await prisma.user.update({
            where: { id: existingByEmail.id },
            data: {
              googleSub,
              name,
              avatarUrl,
              role,
            },
          })
        : await prisma.user.create({
            data: {
              email,
              name,
              avatarUrl,
              googleSub,
              role,
            },
          });

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      getJwtSecret(),
      { expiresIn: '7d' },
    );

    const frontend = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const next = st.next ? `&next=${encodeURIComponent(st.next)}` : '';
    const redirectTo = `${frontend}/auth/callback?token=${encodeURIComponent(token)}${next}`;
    return res.redirect(redirectTo);
  }

  async me(req: Request, res: Response) {
    const user = (req as any).user as { id: number };
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, avatarUrl: true, role: true },
    });

    if (!dbUser) return res.status(404).json({ error: 'User not found' });
    return res.json(dbUser);
  }

  async adminLogin(req: Request, res: Response) {
    const username = String(req.body?.username || '');
    const password = String(req.body?.password || '');

    const envUser = process.env.ADMIN_USERNAME || '';
    const envPass = process.env.ADMIN_PASSWORD || '';
    if (!envUser || !envPass) {
      return res.status(500).json({ error: 'Admin credentials are not configured' });
    }

    if (!safeEq(username, envUser) || !safeEq(password, envPass)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const email = getAdminEmail();
    const googleSub = `admin:${envUser}`;

    const user = await prisma.user.upsert({
      where: { email },
      update: { role: 'ADMIN', googleSub },
      create: {
        email,
        googleSub,
        role: 'ADMIN',
        name: 'Admin',
      },
    });

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: 'ADMIN',
        name: user.name,
      },
      getJwtSecret(),
      { expiresIn: '7d' },
    );

    return res.json({ token });
  }
}

export const authController = new AuthController();

import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import type { Role } from '../../config/constants.js';

export interface SessionClaims extends JwtPayload {
  userId: string;
  role: Role;
  tokenVersion: number;
}

const isSessionClaims = (payload: string | JwtPayload): payload is SessionClaims =>
  typeof payload !== 'string' &&
  typeof payload.userId === 'string' &&
  typeof payload.role === 'string' &&
  Number.isInteger(payload.tokenVersion);

export const getTokenFromRequest = (req: { headers: { authorization?: string } }) => {
  const authHeader = req.headers.authorization ?? '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
};

export const generateAccessToken = (payload: Pick<SessionClaims, 'userId' | 'role' | 'tokenVersion'>) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: '15m' });

export const generateRefreshToken = (payload: Pick<SessionClaims, 'userId' | 'role' | 'tokenVersion'>) =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: '7d' });

const verify = (token: unknown, tokenSecret: string): SessionClaims | null => {
  if (typeof token !== 'string' || !token) return null;
  try {
    const payload = jwt.verify(token, tokenSecret);
    return isSessionClaims(payload) ? payload : null;
  } catch {
    return null;
  }
};

export const verifyAccessToken = (token: unknown) => verify(token, env.jwtSecret);
export const verifyRefreshToken = (token: unknown) => verify(token, env.jwtRefreshSecret);
export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

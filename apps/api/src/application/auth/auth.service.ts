import { SELF_REGISTRATION_ROLE } from '../../config/constants.js';
import { isRole } from '../../domain/access/accessPolicy.js';
import {
  PASSWORD_POLICY_TEXT,
  validateLoginPayload,
  validateRegisterPayload,
} from '../../domain/auth/credentialPolicy.js';
import { db, idFactory } from '../../infrastructure/persistence/index.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyPassword,
  verifyRefreshToken,
} from '../../infrastructure/security/auth.js';

const findUserByEmail = (email: string) => db.user.findUnique({ where: { email } });

const sessionFor = (user: { id: string; role: string; tokenVersion: number }) => {
  if (!isRole(user.role)) return null;
  const claims = { userId: user.id, role: user.role, tokenVersion: user.tokenVersion };
  return {
    accessToken: generateAccessToken(claims),
    refreshToken: generateRefreshToken(claims),
  };
};

export const authService = {
  async register(input: { name?: unknown; email?: unknown; password?: unknown }) {
    const validated = validateRegisterPayload(input);
    if ('error' in validated) return validated;

    if (await findUserByEmail(validated.email)) {
      return { error: 'User already exists', status: 409 };
    }

    const user = await db.user.create({
      data: {
        id: idFactory('user'),
        name: validated.name,
        email: validated.email,
        role: SELF_REGISTRATION_ROLE,
        password: await hashPassword(validated.password),
      },
    });
    const session = sessionFor(user);
    if (!session) return { error: 'Account role is invalid', status: 500 };
    return { ...session, user: { id: user.id, name: user.name, role: user.role } };
  },

  async login(email: unknown, password: unknown) {
    const validated = validateLoginPayload(email, password);
    if ('error' in validated) return validated;

    const user = await findUserByEmail(validated.email);
    if (!user || !(await verifyPassword(validated.password, user.password))) {
      return { error: 'Invalid credentials', status: 401 };
    }

    const session = sessionFor(user);
    if (!session) return { error: 'Account role is invalid', status: 403 };
    return { ...session, user: { id: user.id, name: user.name, role: user.role } };
  },

  async getProfile(userId?: string) {
    if (!userId) return { error: 'User not found', status: 404 };
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: 'User not found', status: 404 };
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      passwordPolicy: PASSWORD_POLICY_TEXT,
    };
  },

  async updateProfile(userId: string | undefined, input: { name?: unknown; email?: unknown }) {
    if (!userId) return { error: 'User not found', status: 404 };
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: 'User not found', status: 404 };

    const nextName = `${input.name ?? ''}`.trim();
    const nextEmail = `${input.email ?? ''}`.trim().toLowerCase();
    if (nextName.length < 2) return { error: 'Name must be at least 2 characters', status: 422 };
    if (!nextEmail.includes('@')) return { error: 'A valid email is required', status: 422 };

    const existingUser = await db.user.findUnique({ where: { email: nextEmail } });
    if (existingUser && existingUser.id !== userId) return { error: 'Email already in use', status: 409 };

    const updated = await db.user.update({ where: { id: userId }, data: { name: nextName, email: nextEmail } });
    return { user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role } };
  },

  async changePassword(userId: string | undefined, currentPassword: unknown, newPassword: unknown) {
    if (!userId) return { error: 'User not found', status: 404 };
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: 'User not found', status: 404 };
    if (!(await verifyPassword(`${currentPassword ?? ''}`, user.password))) {
      return { error: 'Current password is incorrect', status: 422 };
    }

    const policyCheck = validateRegisterPayload({ name: user.name, email: user.email, password: newPassword });
    if ('error' in policyCheck) return policyCheck;

    await db.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(policyCheck.password), tokenVersion: { increment: 1 } },
    });
    return { message: 'Password updated' };
  },

  async refreshToken(token: unknown) {
    const payload = verifyRefreshToken(token);
    if (!payload) return { error: 'Invalid or expired refresh token', status: 401 };

    const user = await db.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.tokenVersion !== payload.tokenVersion || !isRole(user.role)) {
      return { error: 'Refresh token has been revoked', status: 401 };
    }

    return {
      accessToken: generateAccessToken({ userId: user.id, role: user.role, tokenVersion: user.tokenVersion }),
    };
  },
};

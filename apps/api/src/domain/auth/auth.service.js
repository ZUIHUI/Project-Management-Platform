import { db, idFactory } from '../../data/db.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyPassword,
  verifyRefreshToken,
} from '../../common/auth.js';
import { PASSWORD_POLICY_TEXT, validateLoginPayload, validateRegisterPayload } from './credentialPolicy.js';

const findUserByEmail = async (email) => db.user.findUnique({ where: { email } });

export const authService = {
  async register({ name, email, password, role = 'viewer' }) {
    const validated = validateRegisterPayload({ name, email, password });
    if (validated.error) return validated;

    const existingUser = await findUserByEmail(validated.email);
    if (existingUser) return { error: 'User already exists', status: 409 };

    const hashedPassword = await hashPassword(validated.password);
    const user = await db.user.create({
      data: { id: idFactory('user'), name: validated.name, email: validated.email, role, password: hashedPassword },
    });

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });
    return { accessToken, refreshToken, user: { id: user.id, name: user.name, role: user.role } };
  },

  async login(email, password) {
    const validated = validateLoginPayload(email, password);
    if (validated.error) return validated;

    const user = await findUserByEmail(validated.email);
    if (!user) return { error: 'Invalid credentials', status: 401 };

    const validPassword = await verifyPassword(validated.password, user.password);
    if (!validPassword) return { error: 'Invalid credentials', status: 401 };

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    return { accessToken, refreshToken, user: { id: user.id, name: user.name, role: user.role } };
  },

  async getProfile(userId) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: 'User not found', status: 404 };

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      passwordPolicy: PASSWORD_POLICY_TEXT,
    };
  },

  async updateProfile(userId, { name, email }) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: 'User not found', status: 404 };

    const nextName = `${name ?? ''}`.trim();
    const nextEmail = `${email ?? ''}`.trim().toLowerCase();

    if (!nextName || nextName.length < 2) {
      return { error: 'Name must be at least 2 characters', status: 422 };
    }

    if (!nextEmail || !nextEmail.includes('@')) {
      return { error: 'A valid email is required', status: 422 };
    }

    const existingUser = await db.user.findUnique({ where: { email: nextEmail } });
    if (existingUser && existingUser.id !== userId) {
      return { error: 'Email already in use', status: 409 };
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { name: nextName, email: nextEmail },
    });

    return { user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role } };
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: 'User not found', status: 404 };

    const validCurrentPassword = await verifyPassword(`${currentPassword ?? ''}`, user.password);
    if (!validCurrentPassword) return { error: 'Current password is incorrect', status: 401 };

    const policyCheck = validateRegisterPayload({ name: user.name, email: user.email, password: newPassword });
    if (policyCheck.error) return policyCheck;

    await db.user.update({ where: { id: user.id }, data: { password: await hashPassword(policyCheck.password) } });
    return { message: 'Password updated' };
  },

  async refreshToken(token) {
    const payload = verifyRefreshToken(token);
    if (!payload) return { error: 'Invalid or expired refresh token', status: 401 };

    const accessToken = generateAccessToken({ userId: payload.userId, role: payload.role });
    return { accessToken };
  },
};

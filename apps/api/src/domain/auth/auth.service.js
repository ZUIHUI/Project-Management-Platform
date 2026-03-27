import { db, idFactory } from "../../data/inMemoryDB.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyPassword,
  verifyRefreshToken,
} from "../../common/auth.js";

const findUserByEmail = async (email) => db.users.find((user) => user.email === email);

export const authService = {
  async register({ name, email, password, role = "viewer" }) {
    if (!name || !email || !password) {
      return { error: "name, email and password are required", status: 422 };
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return { error: "User already exists", status: 409 };
    }

    const hashedPassword = await hashPassword(password);
    const user = {
      id: idFactory("user"),
      name,
      email: normalizedEmail,
      role,
      password: hashedPassword,
    };
    db.users.push(user);

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    return { accessToken, refreshToken, user: { id: user.id, name: user.name, role: user.role } };
  },

  async login(email, password) {
    const normalizedEmail = (email || "").toLowerCase();
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return { error: "Invalid credentials", status: 401 };
    }

    const validPassword = await verifyPassword(password, user.password);
    if (!validPassword) {
      return { error: "Invalid credentials", status: 401 };
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    return { accessToken, refreshToken, user: { id: user.id, name: user.name, role: user.role } };
  },

  async refreshToken(token) {
    const payload = verifyRefreshToken(token);
    if (!payload) {
      return { error: "Invalid or expired refresh token", status: 401 };
    }

    const accessToken = generateAccessToken({ userId: payload.userId, role: payload.role });
    return { accessToken };
  },
};

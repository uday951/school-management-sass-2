import { prisma } from '../prisma';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { AppError } from '../middlewares/error.middleware';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || '2df4d8a1c97a8e52e46b0742f9b8c2d1b092ac0df10a5198bc725e21fbefdc0f';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '7f5e1ad3490b8f7ce5b8c9d1a3c7e4fa0d2e8bf560ca1892decf451a90bf23c4';

export const authService = {
  generateTokens: (user: any) => {
    const payload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
      tenantId: user.tenantId,
    };

    const accessToken = jwt.sign(payload, ACCESS_SECRET, {
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any,
    });

    const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
    });

    return { accessToken, refreshToken };
  },

  hashToken: (token: string) => {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  login: async (email: string, pass: string, userAgent?: string, ipAddress?: string) => {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const isValid = await argon2.verify(user.passwordHash, pass);
    if (!isValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    if (user.status === 'SUSPENDED') {
      throw new AppError(401, 'Account suspended');
    }

    const { accessToken, refreshToken } = authService.generateTokens(user);
    const tokenHash = authService.hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save refresh session
    await prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return { user, accessToken, refreshToken };
  },

  refresh: async (token: string, userAgent?: string, ipAddress?: string) => {
    if (!token) {
      throw new AppError(401, 'Refresh token required');
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, REFRESH_SECRET);
    } catch {
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    const tokenHash = authService.hashToken(token);
    const session = await prisma.refreshSession.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session || session.revokedAt || new Date() > session.expiresAt) {
      throw new AppError(401, 'Invalid, revoked or expired refresh session');
    }

    // Revoke old session (rotate)
    await prisma.refreshSession.delete({
      where: { id: session.id },
    });

    const user = session.user;
    if (user.status === 'SUSPENDED') {
      throw new AppError(401, 'Account suspended');
    }

    const { accessToken, refreshToken: newRefreshToken } = authService.generateTokens(user);
    const newHash = authService.hashToken(newRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash: newHash,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    return { accessToken, refreshToken: newRefreshToken };
  },

  logout: async (token: string) => {
    if (!token) return;
    const tokenHash = authService.hashToken(token);
    try {
      await prisma.refreshSession.delete({
        where: { tokenHash },
      });
    } catch {
      // Ignore if session already deleted
    }
  },
};

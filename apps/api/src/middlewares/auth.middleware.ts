import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { AppError } from './error.middleware';
import type { AuthenticatedUser } from '../types/express';

interface TokenPayload {
  sub: string;
  email: string;
  userType: string;
  tenantId: string | null;
}

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new AppError(401, 'Authentication token required');
    }

    const accessSecret = process.env.JWT_ACCESS_SECRET || '2df4d8a1c97a8e52e46b0742f9b8c2d1b092ac0df10a5198bc725e21fbefdc0f';
    let decoded: TokenPayload;

    try {
      decoded = jwt.verify(token, accessSecret) as TokenPayload;
    } catch {
      throw new AppError(401, 'Invalid or expired access token');
    }

    // Resolve user details
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        tenantId: true,
        status: true,
      },
    });

    if (!user) {
      throw new AppError(401, 'User not found');
    }

    if (user.status === 'SUSPENDED') {
      throw new AppError(401, 'Account suspended');
    }

    if (user.status !== 'ACTIVE' && user.status !== 'INVITED') {
      throw new AppError(401, 'Account inactive');
    }

    req.user = user as AuthenticatedUser;
    req.tenantId = user.tenantId || undefined;
    next();
  } catch (error) {
    next(error);
  }
}

export function requirePlatformAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user || req.user.userType !== 'PLATFORM_SUPER_ADMIN') {
    return next(new AppError(403, 'This workspace requires Platform Super Admin access'));
  }
  next();
}

export async function requireSchoolAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user || req.user.userType !== 'SCHOOL_ADMIN') {
      throw new AppError(403, 'This workspace requires School Admin access privileges');
    }

    if (!req.user.tenantId) {
      throw new AppError(403, 'No tenant context mapped to your account');
    }

    // Validate the school status under this tenant context
    const school = await prisma.school.findFirst({
      where: { tenantId: req.user.tenantId },
      select: { id: true, status: true },
    });

    if (!school) {
      throw new AppError(403, 'No school tenant found for this account');
    }

    if (school.status === 'SUSPENDED') {
      throw new AppError(
        403,
        'Your school access has been suspended. Please contact the platform owner.',
      );
    }

    if (school.status === 'ARCHIVED') {
      throw new AppError(
        403,
        'This school tenant has been permanently archived.',
      );
    }

    // Inject tenantId and schoolId to the request context
    req.tenantId = req.user.tenantId;
    req.schoolId = school.id;

    next();
  } catch (error) {
    next(error);
  }
}

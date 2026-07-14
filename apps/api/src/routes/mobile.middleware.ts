import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { AppError } from '../middlewares/error.middleware';

export async function resolveMobileUserContext(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized access token');
    }

    if (!req.user.tenantId) {
      throw new AppError(403, 'No tenant context mapped to user account');
    }

    const school = await prisma.school.findFirst({
      where: { tenantId: req.user.tenantId },
      select: { id: true, status: true },
    });

    if (!school) {
      throw new AppError(403, 'No active school tenant mapped to user');
    }

    if (school.status === 'SUSPENDED') {
      throw new AppError(403, 'Access denied. School workspace is suspended');
    }

    if (school.status === 'ARCHIVED') {
      throw new AppError(403, 'Access denied. School workspace is permanently archived');
    }

    req.tenantId = req.user.tenantId;
    req.schoolId = school.id;

    next();
  } catch (error) {
    next(error);
  }
}

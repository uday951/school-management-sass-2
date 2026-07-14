import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public override message: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Format validation errors nicely
  if (err.name === 'ZodError') {
    return res.status(400).json({
      statusCode: 400,
      message: 'Validation failed',
      errors: err.errors,
    });
  }

  // Handle Prisma unique constraint error
  if (err.code === 'P2002') {
    return res.status(409).json({
      statusCode: 409,
      message: 'Resource unique constraint conflict.',
    });
  }

  // Handle Prisma malformed ObjectID (invalid MongoDB id format)
  if (err.code === 'P2023' || (err.message && err.message.includes('Malformed ObjectID'))) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Invalid resource identifier format.',
    });
  }

  // Handle Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      statusCode: 404,
      message: err.meta?.cause || 'Resource not found.',
    });
  }

  res.status(statusCode).json({
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

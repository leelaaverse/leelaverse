import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config/config';
import { AppError, asyncHandler } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  role?: string; // optional; not in current schema by default
  };
}

export const authenticate = asyncHandler(async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    throw new AppError('Not authorized to access this route', 401, 'NO_TOKEN');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string };

    // Get user from database
  const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
    // role not present in schema; add if you introduce roles later
      },
    });

    if (!user) {
      throw new AppError('No user found with this token', 401, 'INVALID_TOKEN');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expired', 401, 'TOKEN_EXPIRED');
    }
    throw error;
  }
});

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Not authorized to access this route', 401, 'NO_USER');
    }

  const userRole = req.user.role;
  if (!userRole || !roles.includes(userRole)) {
      throw new AppError(`User role '${req.user.role}' is not authorized to access this route`, 403, 'INSUFFICIENT_PERMISSIONS');
    }

    next();
  };
};

export const optionalAuth = asyncHandler(async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token, just continue
  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string };

    // Get user from database
  const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
    // role not present in schema; add if you introduce roles later
      },
    });

  if (user) {
      req.user = user;
    }
  } catch (error) {
    // Ignore errors for optional auth
  }

  next();
});

import type { RequestHandler } from 'express';

import { verifyAccessToken } from '../config/jwt';
import { AppError } from '../utils/appError';

const extractToken = (authorizationHeader?: string) => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, credentials] = authorizationHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !credentials) {
    return null;
  }

  return credentials;
};

export const authenticate: RequestHandler = (req, _res, next) => {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    return next(new AppError('Authentication required', 401));
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    return next();
  } catch {
    return next(new AppError('Invalid or expired token', 401));
  }
};


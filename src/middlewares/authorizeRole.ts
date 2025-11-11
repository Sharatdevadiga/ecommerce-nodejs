import type { RequestHandler } from 'express';

import type { UserRole } from '../database/models/user.model';
import { AppError } from '../utils/appError';

export const authorizeRole =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403));
    }

    return next();
  };


import type { RequestHandler } from 'express';
import { validationResult } from 'express-validator';

import { AppError } from '../utils/appError';

export const validateRequest: RequestHandler = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  return next(
    new AppError('Validation failed', 422, {
      errors: result.array(),
    }),
  );
};


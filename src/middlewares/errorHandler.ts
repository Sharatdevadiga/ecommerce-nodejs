import type { ErrorRequestHandler } from 'express';
import { AppError, isAppError } from '../utils/appError';
import env from '../config/env';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const error = isAppError(err)
    ? err
    : new AppError('Internal server error', 500, undefined, false);

  if (!isAppError(err) || !error.isOperational || env.nodeEnv !== 'production') {
    console.error(err);
  }

  res.status(error.statusCode).json({
    message: error.message,
    ...(error.details ? { details: error.details } : {}),
  });
};


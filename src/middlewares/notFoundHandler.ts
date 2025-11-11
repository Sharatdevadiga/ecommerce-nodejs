import type { RequestHandler } from 'express';
import { AppError } from '../utils/appError';

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new AppError('Resource not found', 404));
};


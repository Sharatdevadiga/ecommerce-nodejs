import { body } from 'express-validator';

export const signupValidator = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('password')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter'),
  body('password')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number'),
];

export const loginValidator = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const refreshTokenValidator = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];


import { body, param, query } from 'express-validator';

export const createCategoryValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional({ nullable: true }).isString().withMessage('Description must be a string'),
];

export const updateCategoryValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional({ nullable: true }).isString().withMessage('Description must be a string'),
];

export const categoryIdParamValidator = [
  param('id').isUUID('4').withMessage('Category id must be a valid UUID'),
];

export const listCategoriesValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
];


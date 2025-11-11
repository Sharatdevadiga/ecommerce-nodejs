import { body, query } from 'express-validator';

export const createProductValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 255 })
    .withMessage('Product name must be at most 255 characters'),
  body('description').optional().trim().isString().withMessage('Description must be a string'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
    .toFloat(),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
    .toInt(),
  body('categoryId')
    .isUUID()
    .withMessage('Category ID must be a valid UUID')
    .notEmpty()
    .withMessage('Category ID is required'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),
];

export const updateProductValidators = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Product name must be at most 255 characters'),
  body('description').optional().trim().isString().withMessage('Description must be a string'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
    .toFloat(),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
    .toInt(),
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),
];

export const listProductsValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100')
    .toInt(),
  query('categoryId')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number')
    .toFloat(),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number')
    .toFloat(),
  query('search')
    .optional()
    .trim()
    .isString()
    .withMessage('Search must be a string')
    .isLength({ max: 100 })
    .withMessage('Search must be at most 100 characters'),
];


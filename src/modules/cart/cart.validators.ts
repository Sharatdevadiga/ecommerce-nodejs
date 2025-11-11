import { body, param } from 'express-validator';

export const addToCartValidators = [
  body('productId')
    .isUUID()
    .withMessage('Product ID must be a valid UUID')
    .notEmpty()
    .withMessage('Product ID is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
    .toInt(),
];

export const updateCartItemValidators = [
  param('id').isUUID().withMessage('Cart item ID must be a valid UUID'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
    .toInt(),
];

export const removeFromCartValidators = [
  param('id').isUUID().withMessage('Cart item ID must be a valid UUID'),
];


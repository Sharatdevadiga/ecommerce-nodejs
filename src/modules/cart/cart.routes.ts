import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  handleAddToCart,
  handleClearCart,
  handleGetCart,
  handleRemoveFromCart,
  handleUpdateCartItem,
} from './cart.controller';
import {
  addToCartValidators,
  removeFromCartValidators,
  updateCartItemValidators,
} from './cart.validators';

const router = Router();

router.use(authenticate);

router.get('/', handleGetCart);

router.post('/', addToCartValidators, validateRequest, handleAddToCart);

router.patch('/:id', updateCartItemValidators, validateRequest, handleUpdateCartItem);

router.delete('/:id', removeFromCartValidators, validateRequest, handleRemoveFromCart);

router.delete('/', handleClearCart);

export default router;


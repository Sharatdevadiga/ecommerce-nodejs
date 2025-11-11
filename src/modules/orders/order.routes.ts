import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate';
import { authorizeRole } from '../../middlewares/authorizeRole';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  handleCreateOrder,
  handleGetOrder,
  handleListAllOrders,
  handleListOrders,
} from './order.controller';
import { getOrderValidators, listOrdersValidators } from './order.validators';

const router = Router();

router.post('/', authenticate, handleCreateOrder);

router.get('/', authenticate, listOrdersValidators, validateRequest, handleListOrders);

router.get(
  '/all',
  authenticate,
  authorizeRole('admin'),
  listOrdersValidators,
  validateRequest,
  handleListAllOrders,
);

router.get(
  '/:id',
  authenticate,
  getOrderValidators,
  validateRequest,
  handleGetOrder,
);

export default router;


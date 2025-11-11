import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate';
import { authorizeRole } from '../../middlewares/authorizeRole';
import { validateRequest } from '../../middlewares/validateRequest';
import { uploadSingle } from '../../middlewares/upload';
import {
  handleCreateProduct,
  handleDeleteProduct,
  handleGetProduct,
  handleListProducts,
  handleUpdateProduct,
} from './product.controller';
import {
  createProductValidators,
  listProductsValidators,
  updateProductValidators,
} from './product.validators';

const router = Router();

router.get(
  '/',
  listProductsValidators,
  validateRequest,
  handleListProducts,
);

router.get('/:id', handleGetProduct);

router.post(
  '/',
  authenticate,
  authorizeRole('admin'),
  uploadSingle,
  createProductValidators,
  validateRequest,
  handleCreateProduct,
);

router.patch(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  uploadSingle,
  updateProductValidators,
  validateRequest,
  handleUpdateProduct,
);

router.delete(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  handleDeleteProduct,
);

export default router;


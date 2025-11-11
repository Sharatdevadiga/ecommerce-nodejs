import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate';
import { authorizeRole } from '../../middlewares/authorizeRole';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  handleCreateCategory,
  handleDeleteCategory,
  handleGetCategory,
  handleListCategories,
  handleUpdateCategory,
} from './category.controller';
import {
  categoryIdParamValidator,
  createCategoryValidator,
  listCategoriesValidator,
  updateCategoryValidator,
} from './category.validators';

const router = Router();

router.get('/', listCategoriesValidator, validateRequest, handleListCategories);
router.get('/:id', categoryIdParamValidator, validateRequest, handleGetCategory);

router.post(
  '/',
  authenticate,
  authorizeRole('admin'),
  createCategoryValidator,
  validateRequest,
  handleCreateCategory,
);

router.put(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  categoryIdParamValidator,
  updateCategoryValidator,
  validateRequest,
  handleUpdateCategory,
);

router.delete(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  categoryIdParamValidator,
  validateRequest,
  handleDeleteCategory,
);

export default router;


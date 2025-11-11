import type { RequestHandler } from 'express';

import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from './category.service';

export const handleCreateCategory: RequestHandler = async (req, res, next) => {
  try {
    const category = await createCategory(req.body);
    return res.status(201).json(category);
  } catch (error) {
    return next(error);
  }
};

export const handleListCategories: RequestHandler = async (req, res, next) => {
  try {
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);

    const result = await listCategories({
      page: Number.isNaN(page) ? undefined : page,
      pageSize: Number.isNaN(pageSize) ? undefined : pageSize,
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const handleGetCategory: RequestHandler = async (req, res, next) => {
  try {
    const category = await getCategoryById(req.params.id);
    return res.json(category);
  } catch (error) {
    return next(error);
  }
};

export const handleUpdateCategory: RequestHandler = async (req, res, next) => {
  try {
    const category = await updateCategory(req.params.id, req.body);
    return res.json(category);
  } catch (error) {
    return next(error);
  }
};

export const handleDeleteCategory: RequestHandler = async (req, res, next) => {
  try {
    await deleteCategory(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};


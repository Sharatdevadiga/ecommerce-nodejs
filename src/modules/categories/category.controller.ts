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

    const query: { page?: number; pageSize?: number } = {};
    if (!Number.isNaN(page)) {
      query.page = page;
    }
    if (!Number.isNaN(pageSize)) {
      query.pageSize = pageSize;
    }

    const result = await listCategories(query);

    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const handleGetCategory: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Category ID is required' });
    }
    const category = await getCategoryById(id);
    return res.json(category);
  } catch (error) {
    return next(error);
  }
};

export const handleUpdateCategory: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Category ID is required' });
    }
    const category = await updateCategory(id, req.body);
    return res.json(category);
  } catch (error) {
    return next(error);
  }
};

export const handleDeleteCategory: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Category ID is required' });
    }
    await deleteCategory(id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};


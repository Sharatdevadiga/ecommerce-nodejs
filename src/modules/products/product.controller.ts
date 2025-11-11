import type { RequestHandler } from 'express';

import { uploadImageToCloudinary } from '../../config/cloudinary';
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from './product.service';

export const handleCreateProduct: RequestHandler = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId } = req.body as {
      name: string;
      description?: string;
      price: number;
      stock: number;
      categoryId: string;
    };

    const productData: {
      name: string;
      description?: string | null;
      price: number;
      stock: number;
      categoryId: string;
      imageUrl?: string | null;
    } = {
      name,
      price: Number(price),
      stock: Number(stock),
      categoryId,
    };

    if (description !== undefined) {
      productData.description = description || null;
    }

    if (req.file) {
      productData.imageUrl = await uploadImageToCloudinary(req.file);
    }

    const product = await createProduct(productData);

    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
};

export const handleListProducts: RequestHandler = async (req, res, next) => {
  try {
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);
    const categoryId = req.query.categoryId as string | undefined;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const search = req.query.search as string | undefined;

    const query: {
      page?: number;
      pageSize?: number;
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
    } = {};

    if (!Number.isNaN(page)) {
      query.page = page;
    }
    if (!Number.isNaN(pageSize)) {
      query.pageSize = pageSize;
    }
    if (categoryId) {
      query.categoryId = categoryId;
    }
    if (minPrice !== undefined && !Number.isNaN(minPrice)) {
      query.minPrice = minPrice;
    }
    if (maxPrice !== undefined && !Number.isNaN(maxPrice)) {
      query.maxPrice = maxPrice;
    }
    if (search) {
      query.search = search;
    }

    const result = await listProducts(query);

    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const handleGetProduct: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    const product = await getProductById(id);
    return res.json(product);
  } catch (error) {
    return next(error);
  }
};

export const handleUpdateProduct: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const updateData: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      categoryId?: string;
      imageUrl?: string;
    } = { ...req.body };

    if (req.file) {
      updateData.imageUrl = await uploadImageToCloudinary(req.file);
    }

    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }
    if (updateData.stock !== undefined) {
      updateData.stock = Number(updateData.stock);
    }

    const product = await updateProduct(id, updateData);
    return res.json(product);
  } catch (error) {
    return next(error);
  }
};

export const handleDeleteProduct: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    await deleteProduct(id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};


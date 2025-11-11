import { Op } from 'sequelize';

import { models } from '../../database';
import type {
  Product,
  ProductCreationAttributes,
} from '../../database/models/product.model';
import { AppError } from '../../utils/appError';

export interface ProductListQuery {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface ProductDto {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  } | undefined;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const sanitizeProduct = (product: Product & { category?: { id: string; name: string } }): ProductDto => ({
  id: product.id,
  name: product.name,
  description: product.description ?? null,
  price: Number(product.price),
  stock: product.stock,
  categoryId: product.categoryId,
  category: product.category
    ? {
        id: product.category.id,
        name: product.category.name,
      }
    : undefined,
  imageUrl: product.imageUrl ?? null,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

export const createProduct = async (
  payload: ProductCreationAttributes,
): Promise<ProductDto> => {
  const category = await models.Category.findByPk(payload.categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const product = await models.Product.create({
    name: payload.name.trim(),
    description: payload.description?.trim() ?? null,
    price: payload.price,
    stock: payload.stock,
    categoryId: payload.categoryId,
    imageUrl: payload.imageUrl ?? null,
  });

  return sanitizeProduct(product);
};

export const listProducts = async ({
  page = 1,
  pageSize = 10,
  categoryId,
  minPrice,
  maxPrice,
  search,
}: ProductListQuery): Promise<{
  data: ProductDto[];
  meta: { totalItems: number; page: number; pageSize: number; totalPages: number };
}> => {
  const limit = Math.min(pageSize, 100);
  const offset = (Math.max(page, 1) - 1) * limit;

  const where: Record<string, unknown> = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceConditions: {
      [Op.gte]?: number;
      [Op.lte]?: number;
    } = {};
    if (minPrice !== undefined) {
      priceConditions[Op.gte] = minPrice;
    }
    if (maxPrice !== undefined) {
      priceConditions[Op.lte] = maxPrice;
    }
    where.price = priceConditions;
  }

  if (search) {
    where.name = {
      [Op.iLike]: `%${search.trim()}%`,
    };
  }

  const { rows, count } = await models.Product.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      {
        model: models.Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return {
    data: rows.map(sanitizeProduct),
    meta: {
      totalItems: count,
      page: Math.max(page, 1),
      pageSize: limit,
      totalPages: Math.ceil(count / limit) || 1,
    },
  };
};

export const getProductById = async (id: string): Promise<ProductDto> => {
  const product = await models.Product.findByPk(id, {
    include: [
      {
        model: models.Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
    ],
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return sanitizeProduct(product);
};

export const updateProduct = async (
  id: string,
  payload: Partial<
    Pick<ProductCreationAttributes, 'name' | 'description' | 'price' | 'stock' | 'categoryId' | 'imageUrl'>
  >,
): Promise<ProductDto> => {
  const product = await models.Product.findByPk(id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (payload.categoryId) {
    const category = await models.Category.findByPk(payload.categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    product.categoryId = payload.categoryId;
  }

  if (payload.name) {
    product.name = payload.name.trim();
  }

  if (payload.description !== undefined) {
    product.description = payload.description?.trim() ?? null;
  }

  if (payload.price !== undefined) {
    product.price = payload.price;
  }

  if (payload.stock !== undefined) {
    product.stock = payload.stock;
  }

  if (payload.imageUrl !== undefined) {
    product.imageUrl = payload.imageUrl ?? null;
  }

  await product.save();

  const updated = await models.Product.findByPk(id, {
    include: [
      {
        model: models.Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
    ],
  });

  return sanitizeProduct(updated!);
};

export const deleteProduct = async (id: string): Promise<void> => {
  const deleted = await models.Product.destroy({
    where: { id },
  });

  if (!deleted) {
    throw new AppError('Product not found', 404);
  }
};


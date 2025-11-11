import { Op } from 'sequelize';

import { models } from '../../database';
import type {
  Category,
  CategoryCreationAttributes,
} from '../../database/models/category.model';
import { AppError } from '../../utils/appError';

export interface CategoryListQuery {
  page?: number;
  pageSize?: number;
}

export interface CategoryDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const sanitizeCategory = (category: Category): CategoryDto => ({
  id: category.id,
  name: category.name,
  description: category.description ?? null,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});

export const createCategory = async (
  payload: CategoryCreationAttributes,
): Promise<CategoryDto> => {
  const name = payload.name.trim();

  const existing = await models.Category.findOne({
    where: {
      name: {
        [Op.iLike]: name,
      },
    },
  });

  if (existing) {
    throw new AppError('Category name already exists', 409);
  }

  const category = await models.Category.create({
    name,
    description: payload.description ?? null,
  });

  return sanitizeCategory(category);
};

export const listCategories = async ({
  page = 1,
  pageSize = 10,
}: CategoryListQuery): Promise<{
  data: CategoryDto[];
  meta: { totalItems: number; page: number; pageSize: number; totalPages: number };
}> => {
  const limit = Math.min(pageSize, 100);
  const offset = (Math.max(page, 1) - 1) * limit;

  const { rows, count } = await models.Category.findAndCountAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    data: rows.map(sanitizeCategory),
    meta: {
      totalItems: count,
      page: Math.max(page, 1),
      pageSize: limit,
      totalPages: Math.ceil(count / limit) || 1,
    },
  };
};

export const getCategoryById = async (id: string): Promise<CategoryDto> => {
  const category = await models.Category.findByPk(id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return sanitizeCategory(category);
};

export const updateCategory = async (
  id: string,
  payload: Partial<Pick<CategoryCreationAttributes, 'name' | 'description'>>,
): Promise<CategoryDto> => {
  const category = await models.Category.findByPk(id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  if (payload.name) {
    const trimmedName = payload.name.trim();

    if (trimmedName.toLowerCase() !== category.name.toLowerCase()) {
      const duplicate = await models.Category.findOne({
        where: {
          name: {
            [Op.iLike]: trimmedName,
          },
          id: {
            [Op.ne]: id,
          },
        },
      });

      if (duplicate) {
        throw new AppError('Category name already exists', 409);
      }
    }

    category.name = trimmedName;
  }

  if (payload.description !== undefined) {
    category.description = payload.description ?? null;
  }

  await category.save();

  return sanitizeCategory(category);
};

export const deleteCategory = async (id: string): Promise<void> => {
  const deleted = await models.Category.destroy({
    where: { id },
  });

  if (!deleted) {
    throw new AppError('Category not found', 404);
  }
};


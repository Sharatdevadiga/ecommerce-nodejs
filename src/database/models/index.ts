import type { Sequelize } from 'sequelize';

import { initCategoryModel, Category } from './category.model';
import { initProductModel, Product } from './product.model';
import { initUserModel, User } from './user.model';
import { initUserTokenModel, UserToken } from './userToken.model';

export const initModels = (sequelize: Sequelize) => {
  initCategoryModel(sequelize);
  initProductModel(sequelize);
  initUserModel(sequelize);
  initUserTokenModel(sequelize);

  User.hasMany(UserToken, {
    foreignKey: 'userId',
    as: 'tokens',
    onDelete: 'CASCADE',
    hooks: true,
  });

  UserToken.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
  });

  Category.hasMany(Product, {
    foreignKey: 'categoryId',
    as: 'products',
    onDelete: 'RESTRICT',
  });

  Product.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category',
    onDelete: 'RESTRICT',
  });

  return {
    Category,
    Product,
    User,
    UserToken,
  };
};

export type Models = ReturnType<typeof initModels>;

export { Category, Product, User, UserToken };


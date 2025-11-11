import type { Sequelize } from 'sequelize';

import { initCategoryModel, Category } from './category.model';
import { initUserModel, User } from './user.model';
import { initUserTokenModel, UserToken } from './userToken.model';

export const initModels = (sequelize: Sequelize) => {
  initCategoryModel(sequelize);
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

  return {
    Category,
    User,
    UserToken,
  };
};

export type Models = ReturnType<typeof initModels>;

export { Category, User, UserToken };


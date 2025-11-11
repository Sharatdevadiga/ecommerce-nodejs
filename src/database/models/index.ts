import type { Sequelize } from 'sequelize';

import { initCartItemModel, CartItem } from './cartItem.model';
import { initCategoryModel, Category } from './category.model';
import { initOrderItemModel, OrderItem } from './orderItem.model';
import { initOrderModel, Order } from './order.model';
import { initProductModel, Product } from './product.model';
import { initUserModel, User } from './user.model';
import { initUserTokenModel, UserToken } from './userToken.model';

export const initModels = (sequelize: Sequelize) => {
  initCategoryModel(sequelize);
  initProductModel(sequelize);
  initUserModel(sequelize);
  initUserTokenModel(sequelize);
  initCartItemModel(sequelize);
  initOrderModel(sequelize);
  initOrderItemModel(sequelize);

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

  User.hasMany(CartItem, {
    foreignKey: 'userId',
    as: 'cartItems',
    onDelete: 'CASCADE',
  });

  CartItem.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
  });

  Product.hasMany(CartItem, {
    foreignKey: 'productId',
    as: 'cartItems',
    onDelete: 'CASCADE',
  });

  CartItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product',
    onDelete: 'CASCADE',
  });

  User.hasMany(Order, {
    foreignKey: 'userId',
    as: 'orders',
    onDelete: 'CASCADE',
  });

  Order.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
  });

  Order.hasMany(OrderItem, {
    foreignKey: 'orderId',
    as: 'items',
    onDelete: 'CASCADE',
  });

  OrderItem.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order',
    onDelete: 'CASCADE',
  });

  Product.hasMany(OrderItem, {
    foreignKey: 'productId',
    as: 'orderItems',
    onDelete: 'RESTRICT',
  });

  OrderItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product',
    onDelete: 'RESTRICT',
  });

  return {
    CartItem,
    Category,
    Order,
    OrderItem,
    Product,
    User,
    UserToken,
  };
};

export type Models = ReturnType<typeof initModels>;

export { CartItem, Category, Order, OrderItem, Product, User, UserToken };


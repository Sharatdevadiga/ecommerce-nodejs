import type { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.createTable('cart_items', {
    id: {
      type: 'UUID' as unknown as DataTypes.DataType,
      defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: 'UUID' as unknown as DataTypes.DataType,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    productId: {
      type: 'UUID' as unknown as DataTypes.DataType,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    quantity: {
      type: 'INTEGER',
      allowNull: false,
    },
    priceAtTime: {
      type: 'DECIMAL(10, 2)',
      allowNull: false,
    },
    createdAt: {
      type: 'TIMESTAMP',
      allowNull: false,
      defaultValue: queryInterface.sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: 'TIMESTAMP',
      allowNull: false,
      defaultValue: queryInterface.sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });

  await queryInterface.addIndex('cart_items', ['userId']);
  await queryInterface.addIndex('cart_items', ['productId']);
  await queryInterface.addConstraint('cart_items', {
    fields: ['userId', 'productId'],
    type: 'unique',
    name: 'cart_items_user_product_unique',
  });
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.dropTable('cart_items');
};


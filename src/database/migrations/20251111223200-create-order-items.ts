import type { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.createTable('order_items', {
    id: {
      type: 'UUID' as unknown as DataTypes.DataType,
      defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
      allowNull: false,
    },
    orderId: {
      type: 'UUID' as unknown as DataTypes.DataType,
      allowNull: false,
      references: {
        model: 'orders',
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
      onDelete: 'RESTRICT',
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

  await queryInterface.addIndex('order_items', ['orderId']);
  await queryInterface.addIndex('order_items', ['productId']);
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.dropTable('order_items');
};


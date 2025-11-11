import type { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.createTable('products', {
    id: {
      type: 'UUID' as unknown as DataTypes.DataType,
      defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: 'VARCHAR(255)',
      allowNull: false,
    },
    description: {
      type: 'TEXT',
      allowNull: true,
    },
    price: {
      type: 'DECIMAL(10, 2)',
      allowNull: false,
    },
    stock: {
      type: 'INTEGER',
      allowNull: false,
    },
    categoryId: {
      type: 'UUID' as unknown as DataTypes.DataType,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    imageUrl: {
      type: 'VARCHAR(500)',
      allowNull: true,
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

  await queryInterface.addIndex('products', ['categoryId']);
  await queryInterface.addIndex('products', ['name']);
  await queryInterface.addIndex('products', ['price']);
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.dropTable('products');
};


import type { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.createTable('orders', {
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
    total: {
      type: 'DECIMAL(10, 2)',
      allowNull: false,
    },
    status: {
      type: 'VARCHAR(20)',
      allowNull: false,
      defaultValue: 'pending',
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

  await queryInterface.addIndex('orders', ['userId']);
  await queryInterface.addIndex('orders', ['status']);
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.dropTable('orders');
};


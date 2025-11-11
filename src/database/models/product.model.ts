import { DataTypes, Model, type Optional, type Sequelize } from 'sequelize';

export interface ProductAttributes {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCreationAttributes = Optional<
  ProductAttributes,
  'id' | 'description' | 'imageUrl' | 'createdAt' | 'updatedAt'
>;

export class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  declare id: string;
  declare name: string;
  declare description: string | null;
  declare price: number;
  declare stock: number;
  declare categoryId: string;
  declare imageUrl: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export const initProductModel = (sequelize: Sequelize) =>
  Product.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'products',
      modelName: 'Product',
      timestamps: true,
    },
  );


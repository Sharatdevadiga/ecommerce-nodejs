import { DataTypes, Model, type Optional, type Sequelize } from 'sequelize';

export interface CartItemAttributes {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  priceAtTime: number; // Persistent price when added to cart
  createdAt: Date;
  updatedAt: Date;
}

export type CartItemCreationAttributes = Optional<
  CartItemAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class CartItem
  extends Model<CartItemAttributes, CartItemCreationAttributes>
  implements CartItemAttributes
{
  declare id: string;
  declare userId: string;
  declare productId: string;
  declare quantity: number;
  declare priceAtTime: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export const initCartItemModel = (sequelize: Sequelize) =>
  CartItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      priceAtTime: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
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
      tableName: 'cart_items',
      modelName: 'CartItem',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['userId', 'productId'],
        },
      ],
    },
  );


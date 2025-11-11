import {
  DataTypes,
  Model,
  type Optional,
  type Sequelize,
} from 'sequelize';

export interface CategoryAttributes {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryCreationAttributes = Optional<
  CategoryAttributes,
  'id' | 'description' | 'createdAt' | 'updatedAt'
>;

export class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  declare id: string;

  declare name: string;

  declare description: string | null;

  declare readonly createdAt: Date;

  declare readonly updatedAt: Date;
}

export const initCategoryModel = (sequelize: Sequelize) =>
  Category.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
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
      tableName: 'categories',
      modelName: 'Category',
    },
  );


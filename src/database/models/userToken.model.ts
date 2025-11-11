import {
  DataTypes,
  Model,
  type Optional,
  type Sequelize,
} from 'sequelize';

export interface UserTokenAttributes {
  id: string;
  userId: string;
  tokenHash: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserTokenCreationAttributes = Optional<
  UserTokenAttributes,
  'id' | 'userAgent' | 'ipAddress' | 'createdAt' | 'updatedAt'
>;

export class UserToken
  extends Model<UserTokenAttributes, UserTokenCreationAttributes>
  implements UserTokenAttributes
{
  declare id: string;

  declare userId: string;

  declare tokenHash: string;

  declare userAgent?: string | null;

  declare ipAddress?: string | null;

  declare expiresAt: Date;

  declare readonly createdAt: Date;

  declare readonly updatedAt: Date;
}

export const initUserTokenModel = (sequelize: Sequelize) =>
  UserToken.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      tokenHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userAgent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
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
      tableName: 'user_tokens',
      modelName: 'UserToken',
      indexes: [
        {
          fields: ['userId'],
        },
        {
          fields: ['expiresAt'],
        },
      ],
    },
  );


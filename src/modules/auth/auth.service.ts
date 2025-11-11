import { Op, type Transaction } from 'sequelize';

import { models, sequelize } from '../../database';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../config/jwt';
import type { UserCreationAttributes, UserRole } from '../../database/models/user.model';
import type { User } from '../../database/models/user.model';
import { AppError } from '../../utils/appError';
import { hashPassword, verifyPassword } from '../../utils/password';
import { generateTokenId, hashToken } from '../../utils/token';
import type { AuthResponse, AuthTokens } from './auth.types';

export interface TokenMetadata {
  userAgent?: string;
  ipAddress?: string;
}

const toAuthUser = (user: User): AuthResponse['user'] => ({
  id: user.id,
  email: user.email,
  role: user.role,
});

const saveRefreshToken = async (
  userId: string,
  refreshToken: string,
  metadata: TokenMetadata = {},
  transaction?: Transaction,
): Promise<void> => {
  const payload = verifyRefreshToken(refreshToken);

  const options = transaction ? { transaction } : undefined;

  await models.UserToken.create(
    {
      userId,
      tokenHash: hashToken(refreshToken),
      userAgent: metadata.userAgent ?? null,
      ipAddress: metadata.ipAddress ?? null,
      expiresAt: new Date((payload.exp ?? 0) * 1000),
    },
    options,
  );
};

const destroyRefreshToken = async (userId: string, refreshToken: string) => {
  await models.UserToken.destroy({
    where: {
      userId,
      tokenHash: hashToken(refreshToken),
    },
  });
};

const destroyExpiredTokens = async (userId: string) => {
  await models.UserToken.destroy({
    where: {
      userId,
      expiresAt: {
        [Op.lt]: new Date(),
      },
    },
  });
};

const issueTokens = async (
  user: User,
  metadata: TokenMetadata = {},
  transaction?: Transaction,
): Promise<AuthTokens> => {
  const jti = generateTokenId();
  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, user.role, jti);

  await saveRefreshToken(user.id, refreshToken, metadata, transaction);

  return { accessToken, refreshToken };
};

export const registerUser = async (
  payload: Pick<UserCreationAttributes, 'email' | 'password'> & { role?: UserRole },
  metadata: TokenMetadata = {},
): Promise<AuthResponse> => {
  const existing = await models.User.findOne({
    where: { email: payload.email.toLowerCase() },
  });

  if (existing) {
    throw new AppError('Email is already in use', 409);
  }

  const hashedPassword = await hashPassword(payload.password);

  const result = await sequelize.transaction(async (transaction) => {
    const createdUser = await models.User.create(
      {
        email: payload.email.toLowerCase(),
        password: hashedPassword,
        role: payload.role ?? 'customer',
      },
      { transaction },
    );

    const tokens = await issueTokens(createdUser, metadata, transaction);

    return {
      tokens,
      user: createdUser,
    };
  });

  return {
    user: toAuthUser(result.user),
    tokens: result.tokens,
  };
};

export const authenticateUser = async (
  email: string,
  password: string,
  metadata: TokenMetadata = {},
): Promise<AuthResponse> => {
  const userWithPassword = await models.User.scope('withPassword').findOne({
    where: { email: email.toLowerCase() },
  });

  if (!userWithPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  const passwordIsValid = await verifyPassword(password, userWithPassword.password);

  if (!passwordIsValid) {
    await destroyExpiredTokens(userWithPassword.id);
    throw new AppError('Invalid credentials', 401);
  }

  await destroyExpiredTokens(userWithPassword.id);

  const tokens = await issueTokens(userWithPassword, metadata);

  return {
    user: toAuthUser(userWithPassword),
    tokens,
  };
};

export const refreshAuthTokens = async (
  refreshToken: string,
  metadata: TokenMetadata = {},
): Promise<AuthTokens> => {
  const payload = verifyRefreshToken(refreshToken);

  const storedToken = await models.UserToken.findOne({
    where: {
      userId: payload.sub,
      tokenHash: hashToken(refreshToken),
    },
  });

  if (!storedToken) {
    throw new AppError('Refresh token is invalid or has been revoked', 401);
  }

  if (storedToken.expiresAt.getTime() < Date.now()) {
    await storedToken.destroy();
    throw new AppError('Refresh token is invalid or has been revoked', 401);
  }

  const user = await models.User.findByPk(payload.sub);

  if (!user) {
    await storedToken.destroy();
    throw new AppError('Associated user not found', 404);
  }

  await storedToken.destroy();

  return issueTokens(user, metadata);
};

export const revokeRefreshToken = async (refreshToken: string) => {
  try {
    const payload = verifyRefreshToken(refreshToken);
    await destroyRefreshToken(payload.sub, refreshToken);
  } catch {
    // token already invalid or cannot be parsed; treat as revoked
  }
};


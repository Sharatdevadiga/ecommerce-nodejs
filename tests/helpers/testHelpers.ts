import type { Request } from 'express';
import type { UserRole } from '../../src/database/models/user.model';
import { models, sequelize } from '../../src/database';
import { hashPassword } from '../../src/utils/password';
import { signAccessToken } from '../../src/config/jwt';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  role: UserRole;
}

export const createTestUser = async (
  email: string,
  password: string,
  role: UserRole = 'customer',
): Promise<TestUser> => {
  const hashedPassword = await hashPassword(password);
  // Ensure email is lowercase to match login behavior
  const user = await models.User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
  });

  return {
    id: user.id,
    email: user.email,
    password,
    role: user.role,
  };
};

export const createAuthHeaders = (userId: string, role: UserRole = 'customer') => {
  const token = signAccessToken(userId, role);
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => {
  const headers = (overrides.headers as Record<string, string>) ?? {};
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    get: ((name: string) => {
      if (name === 'set-cookie') {
        return headers[name] ? [headers[name]] : undefined;
      }
      return headers[name] ?? undefined;
    }) as Request['get'],
    ...overrides,
  };
};

export const cleanupTestData = async () => {
  // Clean up in reverse order of dependencies to avoid foreign key constraints
  // Must delete UserToken BEFORE User due to foreign key constraint
  // Use a transaction to ensure atomic cleanup
  const transaction = await sequelize.transaction();
  
  try {
    await models.OrderItem.destroy({ where: {}, force: true, transaction });
    await models.Order.destroy({ where: {}, force: true, transaction });
    await models.CartItem.destroy({ where: {}, force: true, transaction });
    await models.Product.destroy({ where: {}, force: true, transaction });
    await models.Category.destroy({ where: {}, force: true, transaction });
    // UserToken MUST be deleted before User (foreign key constraint)
    await models.UserToken.destroy({ where: {}, force: true, transaction });
    await models.User.destroy({ where: {}, force: true, transaction });
    
    await transaction.commit();
  } catch (e) {
    await transaction.rollback();
    // If cleanup fails, try without transaction as fallback
    try {
      await models.OrderItem.destroy({ where: {}, force: true });
      await models.Order.destroy({ where: {}, force: true });
      await models.CartItem.destroy({ where: {}, force: true });
      await models.Product.destroy({ where: {}, force: true });
      await models.Category.destroy({ where: {}, force: true });
      await models.UserToken.destroy({ where: {}, force: true });
      await models.User.destroy({ where: {}, force: true });
    } catch (fallbackError) {
      // Ignore cleanup errors - tables might be empty
    }
  }
};


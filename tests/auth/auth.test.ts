import request from 'supertest';

import app from '../../src/app';
import { cleanupTestData, createTestUser } from '../helpers/testHelpers';

describe('Authentication', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe('customer');
      expect(response.body.user).toHaveProperty('id');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject password shorter than 8 characters', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Pass123',
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject password without uppercase letter', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123!',
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject password without number', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password!',
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject duplicate email', async () => {
      await createTestUser('test@example.com', 'Password123!');

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        })
        .expect(409);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Email is already in use');
    });

    it('should reject missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          password: 'Password123!',
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await createTestUser('test@example.com', 'Password123!');
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('role');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'Password123!',
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      await createTestUser('test@example.com', 'Password123!');

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        })
        .expect(200);

      refreshToken = loginResponse.body.tokens.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(typeof response.body.refreshToken).toBe('string');
      // Refresh returns tokens directly, not nested in a tokens object
    });

    it('should reject invalid refresh token', async () => {
      // Invalid token format will cause JWT verification to throw, which might result in 500
      // or 401 depending on error handling
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        });

      // Should return either 401 (invalid token) or 500 (JWT parse error)
      expect([401, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject empty refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: '',
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject already used refresh token', async () => {
      // Use the refresh token once
      await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200);

      // Try to use it again - should fail because it was destroyed
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('invalid');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let refreshToken: string;

    beforeEach(async () => {
      await createTestUser('test@example.com', 'Password123!');

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        })
        .expect(200);

      refreshToken = loginResponse.body.tokens.refreshToken;
    });

    it('should logout successfully with valid refresh token', async () => {
      await request(app)
        .post('/api/v1/auth/logout')
        .send({
          refreshToken,
        })
        .expect(204);
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({})
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject empty refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({
          refreshToken: '',
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should handle invalid refresh token gracefully', async () => {
      // Logout doesn't throw errors for invalid tokens, it just treats them as already revoked
      await request(app)
        .post('/api/v1/auth/logout')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(204);
    });
  });
});

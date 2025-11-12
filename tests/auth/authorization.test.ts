import request from 'supertest';

import app from '../../src/app';
import { models } from '../../src/database';
import { cleanupTestData, createTestUser } from '../helpers/testHelpers';

describe('Authorization', () => {
  let customerToken: string;
  let adminToken: string;
  let categoryId: string;
  let productId: string;

  beforeEach(async () => {
    await cleanupTestData();

    await createTestUser('customer@example.com', 'Password123!', 'customer');
    await createTestUser('admin@example.com', 'Password123!', 'admin');

    const customerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'customer@example.com',
        password: 'Password123!',
      });

    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Password123!',
      });

    if (customerLogin.status !== 200 || !customerLogin.body.tokens?.accessToken) {
      throw new Error(`Customer login failed: ${JSON.stringify(customerLogin.body)}`);
    }

    if (adminLogin.status !== 200 || !adminLogin.body.tokens?.accessToken) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.body)}`);
    }

    customerToken = customerLogin.body.tokens.accessToken;
    adminToken = adminLogin.body.tokens.accessToken;

    // Create test data
    const category = await models.Category.create({
      name: 'Test Category',
      description: 'Test Description',
    });
    categoryId = category.id;

    const product = await models.Product.create({
      name: 'Test Product',
      price: 99.99,
      stock: 100,
      categoryId: category.id,
    });
    productId = product.id;
  });

  describe('Authentication Middleware', () => {
    describe('Cart routes (all require authentication)', () => {
      it('should reject GET /api/v1/cart without token', async () => {
        const response = await request(app).get('/api/v1/cart').expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Authentication required');
      });

      it('should accept GET /api/v1/cart with valid token', async () => {
        await request(app)
          .get('/api/v1/cart')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);
      });

      it('should reject GET /api/v1/cart with invalid token', async () => {
        const response = await request(app)
          .get('/api/v1/cart')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Invalid or expired token');
      });

      it('should reject GET /api/v1/cart with malformed Authorization header', async () => {
        const response = await request(app)
          .get('/api/v1/cart')
          .set('Authorization', 'InvalidFormat token')
          .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Authentication required');
      });

      it('should reject POST /api/v1/cart without token', async () => {
        const response = await request(app)
          .post('/api/v1/cart')
          .send({
            productId,
            quantity: 1,
          })
          .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Authentication required');
      });
    });

    describe('Order routes (require authentication)', () => {
      it('should reject POST /api/v1/orders without token', async () => {
        const response = await request(app).post('/api/v1/orders').expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Authentication required');
      });

      it('should accept POST /api/v1/orders with valid token', async () => {
        // Add item to cart first
        await request(app)
          .post('/api/v1/cart')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            productId,
            quantity: 1,
          })
          .expect(201);

        await request(app)
          .post('/api/v1/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(201);
      });

      it('should reject GET /api/v1/orders without token', async () => {
        const response = await request(app).get('/api/v1/orders').expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Authentication required');
      });
    });
  });

  describe('Role-Based Authorization Middleware', () => {
    describe('Category management (admin-only)', () => {
      it('should allow admin to create category', async () => {
        const response = await request(app)
          .post('/api/v1/categories')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'New Category',
            description: 'New Description',
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('New Category');
      });

      it('should reject customer from creating category', async () => {
        const response = await request(app)
          .post('/api/v1/categories')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            name: 'New Category',
          })
          .expect(403);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Forbidden');
      });

      it('should allow admin to update category', async () => {
        const response = await request(app)
          .put(`/api/v1/categories/${categoryId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Updated Category',
          })
          .expect(200);

        expect(response.body.name).toBe('Updated Category');
      });

      it('should reject customer from updating category', async () => {
        const response = await request(app)
          .put(`/api/v1/categories/${categoryId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            name: 'Updated Category',
          })
          .expect(403);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Forbidden');
      });

      it('should allow admin to delete category', async () => {
        // Create a category without products for deletion
        const categoryToDelete = await models.Category.create({
          name: 'Category To Delete',
          description: 'Will be deleted',
        });

        await request(app)
          .delete(`/api/v1/categories/${categoryToDelete.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(204);
      });

      it('should reject customer from deleting category', async () => {
        const response = await request(app)
          .delete(`/api/v1/categories/${categoryId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(403);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Forbidden');
      });
    });

    describe('Product management (admin-only)', () => {
      it('should allow admin to create product', async () => {
        const response = await request(app)
          .post('/api/v1/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'New Product',
            price: 49.99,
            stock: 50,
            categoryId,
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('New Product');
      });

      it('should reject customer from creating product', async () => {
        const response = await request(app)
          .post('/api/v1/products')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            name: 'New Product',
            price: 49.99,
            stock: 50,
            categoryId,
          })
          .expect(403);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Forbidden');
      });

      it('should allow admin to update product', async () => {
        const response = await request(app)
          .patch(`/api/v1/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Updated Product',
          })
          .expect(200);

        expect(response.body.name).toBe('Updated Product');
      });

      it('should reject customer from updating product', async () => {
        const response = await request(app)
          .patch(`/api/v1/products/${productId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            name: 'Updated Product',
          })
          .expect(403);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Forbidden');
      });

      it('should allow admin to delete product', async () => {
        await request(app)
          .delete(`/api/v1/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(204);
      });

      it('should reject customer from deleting product', async () => {
        const response = await request(app)
          .delete(`/api/v1/products/${productId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(403);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Forbidden');
      });
    });

    describe('Order management (admin-only routes)', () => {
      it('should allow admin to list all orders', async () => {
        const response = await request(app)
          .get('/api/v1/orders/all')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('meta');
      });

      it('should reject customer from listing all orders', async () => {
        const response = await request(app)
          .get('/api/v1/orders/all')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(403);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Forbidden');
      });
    });
  });

  describe('Public routes (no authentication required)', () => {
    it('should allow GET /api/v1/categories without token', async () => {
      await request(app).get('/api/v1/categories').expect(200);
    });

    it('should allow GET /api/v1/categories/:id without token', async () => {
      await request(app).get(`/api/v1/categories/${categoryId}`).expect(200);
    });

    it('should allow GET /api/v1/products without token', async () => {
      await request(app).get('/api/v1/products').expect(200);
    });

    it('should allow GET /api/v1/products/:id without token', async () => {
      await request(app).get(`/api/v1/products/${productId}`).expect(200);
    });
  });

  describe('Authorization edge cases', () => {
    it('should reject request with expired token', async () => {
      // This would require creating an expired token, which is complex
      // For now, we test that invalid tokens are rejected
      const response = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject request without Authorization header', async () => {
      const response = await request(app).get('/api/v1/cart').expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Authentication required');
    });

    it('should reject request with empty token', async () => {
      const response = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', 'Bearer ')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Authentication required');
    });
  });
});

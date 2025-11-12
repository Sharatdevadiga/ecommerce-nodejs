import request from 'supertest';

import app from '../../src/app';
import { models } from '../../src/database';
import { cleanupTestData, createTestUser } from '../helpers/testHelpers';

describe('Product Management', () => {
  let adminToken: string;
  let customerToken: string;
  let categoryId: string;
  let categoryId2: string;

  beforeEach(async () => {
    await cleanupTestData();

    await createTestUser('admin@example.com', 'Password123!', 'admin');
    await createTestUser('customer@example.com', 'Password123!', 'customer');

    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Password123!',
      });

    const customerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'customer@example.com',
        password: 'Password123!',
      });

    if (adminLogin.status !== 200 || !adminLogin.body.tokens?.accessToken) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.body)}`);
    }

    if (customerLogin.status !== 200 || !customerLogin.body.tokens?.accessToken) {
      throw new Error(`Customer login failed: ${JSON.stringify(customerLogin.body)}`);
    }

    adminToken = adminLogin.body.tokens.accessToken;
    customerToken = customerLogin.body.tokens.accessToken;

    const category = await models.Category.create({
      name: 'Electronics',
      description: 'Electronic products',
    });
    categoryId = category.id;

    const category2 = await models.Category.create({
      name: 'Clothing',
      description: 'Clothing items',
    });
    categoryId2 = category2.id;
  });

  describe('POST /api/v1/products', () => {
    it('should create a product as admin', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          stock: 100,
          categoryId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Product');
      expect(response.body.description).toBe('Test Description');
      expect(response.body.price).toBe(99.99);
      expect(response.body.stock).toBe(100);
      expect(response.body.categoryId).toBe(categoryId);
      expect(response.body.imageUrl).toBeNull();
    });

    it('should reject product creation from customer', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Test Product',
          price: 99.99,
          stock: 100,
          categoryId,
        })
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Forbidden');
    });

    it('should reject product creation without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .send({
          name: 'Test Product',
          price: 99.99,
          stock: 100,
          categoryId,
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Authentication required');
    });

    it('should reject missing name', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 99.99,
          stock: 100,
          categoryId,
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject missing price', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          stock: 100,
          categoryId,
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject missing stock', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          price: 99.99,
          categoryId,
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject missing categoryId', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          price: 99.99,
          stock: 100,
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject negative price', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          price: -10,
          stock: 100,
          categoryId,
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject negative stock', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          price: 99.99,
          stock: -10,
          categoryId,
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject invalid categoryId format', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          price: 99.99,
          stock: 100,
          categoryId: 'invalid-uuid',
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject non-existent category', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          price: 99.99,
          stock: 100,
          categoryId: fakeId,
        })
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Category not found');
    });

    it('should accept optional description', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          price: 99.99,
          stock: 100,
          categoryId,
        })
        .expect(201);

      expect(response.body.description).toBeNull();
    });

    it('should trim whitespace from name and description', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '  Test Product  ',
          description: '  Test Description  ',
          price: 99.99,
          stock: 100,
          categoryId,
        })
        .expect(201);

      expect(response.body.name).toBe('Test Product');
      expect(response.body.description).toBe('Test Description');
    });
  });

  describe('GET /api/v1/products', () => {
    beforeEach(async () => {
      // Create test products
      await models.Product.bulkCreate([
        {
          name: 'Product 1',
          price: 10.0,
          stock: 50,
          categoryId,
        },
        {
          name: 'Product 2',
          price: 20.0,
          stock: 30,
          categoryId,
        },
        {
          name: 'Product 3',
          price: 30.0,
          stock: 20,
          categoryId,
        },
        {
          name: 'Clothing Product',
          price: 15.0,
          stock: 25,
          categoryId: categoryId2,
        },
      ]);
    });

    it('should list all products without pagination', async () => {
      const response = await request(app).get('/api/v1/products').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data.length).toBeGreaterThanOrEqual(4);
      expect(response.body.meta).toHaveProperty('totalItems');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('pageSize');
      expect(response.body.meta).toHaveProperty('totalPages');
    });

    it('should list products with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .query({ page: 1, pageSize: 2 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.pageSize).toBe(2);
      expect(response.body.meta.totalItems).toBeGreaterThanOrEqual(4);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .query({ categoryId })
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((product: { categoryId: string }) => {
        expect(product.categoryId).toBe(categoryId);
      });
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .query({ minPrice: 15, maxPrice: 25 })
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((product: { price: number }) => {
        expect(product.price).toBeGreaterThanOrEqual(15);
        expect(product.price).toBeLessThanOrEqual(25);
      });
    });

    it('should filter products by minimum price', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .query({ minPrice: 20 })
        .expect(200);

      response.body.data.forEach((product: { price: number }) => {
        expect(product.price).toBeGreaterThanOrEqual(20);
      });
    });

    it('should filter products by maximum price', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .query({ maxPrice: 15 })
        .expect(200);

      response.body.data.forEach((product: { price: number }) => {
        expect(product.price).toBeLessThanOrEqual(15);
      });
    });

    it('should search products by name', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .query({ search: 'Product 1' })
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toContain('Product 1');
    });

    it('should return empty results for non-matching search', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .query({ search: 'NonExistentProduct' })
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should reject invalid page number', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .query({ page: 0 })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject invalid pageSize', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .query({ pageSize: 0 })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject pageSize exceeding maximum', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .query({ pageSize: 101 })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject invalid categoryId format', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .query({ categoryId: 'invalid-uuid' })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject negative minPrice', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .query({ minPrice: -10 })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject negative maxPrice', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .query({ maxPrice: -10 })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/v1/products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await models.Product.create({
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 100,
        categoryId,
      });
      productId = product.id;
    });

    it('should get product by id', async () => {
      const response = await request(app).get(`/api/v1/products/${productId}`).expect(200);

      expect(response.body.id).toBe(productId);
      expect(response.body.name).toBe('Test Product');
      expect(response.body.description).toBe('Test Description');
      expect(response.body.price).toBe(99.99);
      expect(response.body.stock).toBe(100);
      expect(response.body.categoryId).toBe(categoryId);
      expect(response.body).toHaveProperty('category');
      expect(response.body.category?.id).toBe(categoryId);
      expect(response.body.category?.name).toBe('Electronics');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app).get(`/api/v1/products/${fakeId}`).expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Product not found');
    });

    it('should handle invalid product ID format', async () => {
      // Invalid UUID format - might return 404 or 500 depending on implementation
      const response = await request(app).get('/api/v1/products/invalid-id');

      // Accept either 404 (if UUID validation happens) or 500 (if database error)
      expect([404, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PATCH /api/v1/products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await models.Product.create({
        name: 'Test Product',
        description: 'Original Description',
        price: 99.99,
        stock: 100,
        categoryId,
      });
      productId = product.id;
    });

    it('should update product as admin', async () => {
      const response = await request(app)
        .patch(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Product',
          price: 149.99,
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Product');
      expect(response.body.price).toBe(149.99);
      expect(response.body.description).toBe('Original Description'); // Unchanged
      expect(response.body.stock).toBe(100); // Unchanged
    });

    it('should update all fields', async () => {
      const response = await request(app)
        .patch(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Product',
          description: 'Updated Description',
          price: 149.99,
          stock: 50,
          categoryId: categoryId2,
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Product');
      expect(response.body.description).toBe('Updated Description');
      expect(response.body.price).toBe(149.99);
      expect(response.body.stock).toBe(50);
      expect(response.body.categoryId).toBe(categoryId2);
    });

    it('should reject update from customer', async () => {
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

    it('should reject update without authentication', async () => {
      const response = await request(app)
        .patch(`/api/v1/products/${productId}`)
        .send({
          name: 'Updated Product',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Authentication required');
    });

    it('should reject non-existent product', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .patch(`/api/v1/products/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Product',
        })
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Product not found');
    });

    it('should reject invalid categoryId', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .patch(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: fakeId,
        })
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Category not found');
    });

    it('should reject negative price', async () => {
      const response = await request(app)
        .patch(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: -10,
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject negative stock', async () => {
      const response = await request(app)
        .patch(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          stock: -10,
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject empty name', async () => {
      const response = await request(app)
        .patch(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '   ',
        })
        .expect(422);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should allow partial updates', async () => {
      const response = await request(app)
        .patch(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          stock: 200,
        })
        .expect(200);

      expect(response.body.stock).toBe(200);
      expect(response.body.name).toBe('Test Product'); // Unchanged
      expect(response.body.price).toBe(99.99); // Unchanged
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await models.Product.create({
        name: 'Test Product',
        price: 99.99,
        stock: 100,
        categoryId,
      });
      productId = product.id;
    });

    it('should delete product as admin', async () => {
      await request(app)
        .delete(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const product = await models.Product.findByPk(productId);
      expect(product).toBeNull();
    });

    it('should reject delete from customer', async () => {
      const response = await request(app)
        .delete(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Forbidden');
    });

    it('should reject delete without authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/products/${productId}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Authentication required');
    });

    it('should reject non-existent product', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/v1/products/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Product not found');
    });
  });
});

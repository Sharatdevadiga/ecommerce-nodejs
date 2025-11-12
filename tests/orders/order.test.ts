import request from 'supertest';

import app from '../../src/app';
import { models } from '../../src/database';
import { cleanupTestData, createTestUser } from '../helpers/testHelpers';

describe('Order Management', () => {
  let customerToken: string;
  let customerId: string;
  let productId: string;
  let categoryId: string;

  beforeEach(async () => {
    await cleanupTestData();

    const customer = await createTestUser('customer@example.com', 'Password123!', 'customer');
    customerId = customer.id;

    const customerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'customer@example.com',
        password: 'Password123!',
      });

    if (customerLogin.status !== 200 || !customerLogin.body.tokens?.accessToken) {
      throw new Error(`Login failed: ${JSON.stringify(customerLogin.body)}`);
    }

    customerToken = customerLogin.body.tokens.accessToken;

    const category = await models.Category.create({
      name: 'Electronics',
    });
    categoryId = category.id;

    const product = await models.Product.create({
      name: 'Test Product',
      price: 99.99,
      stock: 100,
      categoryId,
    });
    productId = product.id;

    // Add item to cart via API to ensure proper setup
    await request(app)
      .post('/api/v1/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId,
        quantity: 2,
      });
  });

  describe('POST /api/v1/orders', () => {
    it('should create order from cart items', async () => {
      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('items');
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].priceAtTime).toBe(99.99);
      expect(response.body.total).toBe(199.98);
    });

    it('should clear cart after order creation', async () => {
      await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(201);

      const cartItems = await models.CartItem.findAll({
        where: { userId: customerId },
      });
      expect(cartItems).toHaveLength(0);
    });

    it('should maintain price at order time even if product price changes', async () => {
      // Create order with price 99.99
      const orderResponse = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(201);

      // Verify order response has correct price
      expect(orderResponse.body.items[0].priceAtTime).toBe(99.99);

      // Update product price
      await models.Product.update(
        { price: 149.99 },
        { where: { id: productId } },
      );

      // Verify order still has original price by fetching it again
      const getOrderResponse = await request(app)
        .get(`/api/v1/orders/${orderResponse.body.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(getOrderResponse.body.items[0].priceAtTime).toBe(99.99);
    });

    it('should reject order creation with empty cart', async () => {
      // Clear cart via API
      await request(app)
        .delete('/api/v1/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(204);

      await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(400);
    });
  });

  describe('GET /api/v1/orders', () => {
    beforeEach(async () => {
      // Create order via API to ensure proper setup
      await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(201);
    });

    it('should list user orders', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    let orderId: string;

    beforeEach(async () => {
      const order = await models.Order.create({
        userId: customerId,
        total: 199.98,
        status: 'pending',
      });
      orderId = order.id;

      await models.OrderItem.create({
        orderId,
        productId,
        quantity: 2,
        priceAtTime: 99.99,
      });
    });

    it('should get order by id', async () => {
      const response = await request(app)
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.id).toBe(orderId);
      expect(response.body).toHaveProperty('items');
      expect(response.body.items).toHaveLength(1);
    });

    it('should reject access to other user order', async () => {
      const otherCustomer = await createTestUser('other@example.com', 'Password123!', 'customer');
      const otherOrder = await models.Order.create({
        userId: otherCustomer.id,
        total: 100.0,
        status: 'pending',
      });

      // Returns 404 instead of 403 for security (doesn't reveal order exists)
      const response = await request(app)
        .get(`/api/v1/orders/${otherOrder.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Order not found');
    });
  });
});


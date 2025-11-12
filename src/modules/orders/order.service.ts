import { models, sequelize } from '../../database';
import type { Order, OrderStatus } from '../../database/models/order.model';
import { AppError } from '../../utils/appError';
import { getCart } from '../cart/cart.service';

export interface OrderItemDto {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
  quantity: number;
  priceAtTime: number;
  subtotal: number;
}

export interface OrderDto {
  id: string;
  userId: string;
  total: number;
  status: OrderStatus;
  items: OrderItemDto[];
  createdAt: Date;
  updatedAt: Date;
}

const sanitizeOrder = async (order: Order): Promise<OrderDto> => {
  const orderItems = await models.OrderItem.findAll({
    where: { orderId: order.id },
    include: [
      {
        model: models.Product,
        as: 'product',
        attributes: ['id', 'name', 'imageUrl'],
      },
    ],
  });

  const items: OrderItemDto[] = orderItems.map((item) => {
    const productData = item.get('product') as { id: string; name: string; imageUrl: string | null };
    return {
      id: item.id,
      productId: item.productId,
      product: {
        id: productData.id,
        name: productData.name,
        imageUrl: productData.imageUrl ?? null,
      },
      quantity: item.quantity,
      priceAtTime: Number(item.priceAtTime),
      subtotal: Number(item.priceAtTime) * item.quantity,
    };
  });

  return {
    id: order.id,
    userId: order.userId,
    total: Number(order.total),
    status: order.status,
    items,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

export const createOrder = async (userId: string): Promise<OrderDto> => {
  const cart = await getCart(userId);

  if (cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  // Verify all products still exist and have sufficient stock
  for (const item of cart.items) {
    const product = await models.Product.findByPk(item.productId);
    if (!product) {
      throw new AppError(`Product ${item.product.name} is no longer available`, 400);
    }
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
    }
  }

  const transaction = await sequelize.transaction();

  try {
    // Create order
    const order = await models.Order.create(
      {
        userId,
        total: cart.total,
        status: 'pending',
      },
      { transaction },
    );

    // Create order items with persistent prices
    await Promise.all(
      cart.items.map((item) =>
        models.OrderItem.create(
          {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtTime: item.priceAtAdd, // Use price from cart (persistent)
          },
          { transaction },
        ),
      ),
    );

    // Update product stock
    for (const item of cart.items) {
      await models.Product.decrement('stock', {
        by: item.quantity,
        where: { id: item.productId },
        transaction,
      });
    }

    // Clear cart
    await models.CartItem.destroy({
      where: { userId },
      transaction,
    });

    await transaction.commit();

    return sanitizeOrder(order);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const listOrders = async (
  userId: string,
  options?: { page?: number; pageSize?: number },
): Promise<{
  data: OrderDto[];
  meta: { totalItems: number; page: number; pageSize: number; totalPages: number };
}> => {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;
  const limit = Math.min(pageSize, 100);
  const offset = (Math.max(page, 1) - 1) * limit;

  const { rows, count } = await models.Order.findAndCountAll({
    where: { userId },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  const data = await Promise.all(rows.map(sanitizeOrder));

  return {
    data,
    meta: {
      totalItems: count,
      page: Math.max(page, 1),
      pageSize: limit,
      totalPages: Math.ceil(count / limit) || 1,
    },
  };
};

export const getOrderById = async (userId: string, orderId: string): Promise<OrderDto> => {
  const order = await models.Order.findOne({
    where: {
      id: orderId,
      userId,
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  return sanitizeOrder(order);
};

export const listAllOrders = async (options?: {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
}): Promise<{
  data: OrderDto[];
  meta: { totalItems: number; page: number; pageSize: number; totalPages: number };
}> => {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;
  const limit = Math.min(pageSize, 100);
  const offset = (Math.max(page, 1) - 1) * limit;

  const where: { status?: OrderStatus } = {};
  if (options?.status) {
    where.status = options.status;
  }

  const { rows, count } = await models.Order.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  const data = await Promise.all(rows.map(sanitizeOrder));

  return {
    data,
    meta: {
      totalItems: count,
      page: Math.max(page, 1),
      pageSize: limit,
      totalPages: Math.ceil(count / limit) || 1,
    },
  };
};


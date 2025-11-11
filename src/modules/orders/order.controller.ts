import type { RequestHandler } from 'express';

import {
  createOrder,
  getOrderById,
  listAllOrders,
  listOrders,
} from './order.service';

export const handleCreateOrder: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const order = await createOrder(userId);
    return res.status(201).json(order);
  } catch (error) {
    return next(error);
  }
};

export const handleListOrders: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);

    const options: { page?: number; pageSize?: number } = {};
    if (!Number.isNaN(page)) {
      options.page = page;
    }
    if (!Number.isNaN(pageSize)) {
      options.pageSize = pageSize;
    }

    const result = await listOrders(userId, options);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const handleGetOrder: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const orderId = req.params.id;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await getOrderById(userId, orderId);
    return res.json(order);
  } catch (error) {
    return next(error);
  }
};

export const handleListAllOrders: RequestHandler = async (req, res, next) => {
  try {
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);
    const status = req.query.status as string | undefined;

    const options: {
      page?: number;
      pageSize?: number;
      status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    } = {};

    if (!Number.isNaN(page)) {
      options.page = page;
    }
    if (!Number.isNaN(pageSize)) {
      options.pageSize = pageSize;
    }
    if (status) {
      options.status = status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    }

    const result = await listAllOrders(options);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};


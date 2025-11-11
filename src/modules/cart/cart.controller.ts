import type { RequestHandler } from 'express';

import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from './cart.service';

export const handleAddToCart: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { productId, quantity } = req.body as { productId: string; quantity: number };

    const cartItem = await addToCart(userId, productId, quantity);
    return res.status(201).json(cartItem);
  } catch (error) {
    return next(error);
  }
};

export const handleGetCart: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const cart = await getCart(userId);
    return res.json(cart);
  } catch (error) {
    return next(error);
  }
};

export const handleUpdateCartItem: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const cartItemId = req.params.id;
    if (!cartItemId) {
      return res.status(400).json({ message: 'Cart item ID is required' });
    }
    const { quantity } = req.body as { quantity: number };

    const cartItem = await updateCartItem(userId, cartItemId, quantity);
    return res.json(cartItem);
  } catch (error) {
    return next(error);
  }
};

export const handleRemoveFromCart: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const cartItemId = req.params.id;
    if (!cartItemId) {
      return res.status(400).json({ message: 'Cart item ID is required' });
    }

    await removeFromCart(userId, cartItemId);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export const handleClearCart: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    await clearCart(userId);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};


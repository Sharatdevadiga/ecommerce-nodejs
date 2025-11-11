import { models } from '../../database';
import { AppError } from '../../utils/appError';

export interface CartItemDto {
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

export interface CartDto {
  items: CartItemDto[];
  total: number;
  itemCount: number;
}

export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number,
): Promise<CartItemDto> => {
  const product = await models.Product.findByPk(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.stock < quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  const currentPrice = Number(product.price);

  const [cartItem] = await models.CartItem.findOrCreate({
    where: {
      userId,
      productId,
    },
    defaults: {
      userId,
      productId,
      quantity,
      priceAtTime: currentPrice,
    },
  });

  if (cartItem.productId !== productId) {
    // Item already exists, update quantity and price
    cartItem.quantity += quantity;
    cartItem.priceAtTime = currentPrice; // Update to current price when modifying
    await cartItem.save();
  }

  const updated = await models.CartItem.findByPk(cartItem.id, {
    include: [
      {
        model: models.Product,
        as: 'product',
        attributes: ['id', 'name', 'imageUrl'],
      },
    ],
  });

  if (!updated) {
    throw new AppError('Failed to retrieve cart item', 500);
  }

  const productData = updated.get('product') as { id: string; name: string; imageUrl: string | null };

  return {
    id: updated.id,
    productId: updated.productId,
    product: {
      id: productData.id,
      name: productData.name,
      imageUrl: productData.imageUrl ?? null,
    },
    quantity: updated.quantity,
    priceAtTime: Number(updated.priceAtTime),
    subtotal: Number(updated.priceAtTime) * updated.quantity,
  };
};

export const getCart = async (userId: string): Promise<CartDto> => {
  const cartItems = await models.CartItem.findAll({
    where: { userId },
    include: [
      {
        model: models.Product,
        as: 'product',
        attributes: ['id', 'name', 'imageUrl'],
      },
    ],
    order: [['createdAt', 'ASC']],
  });

  const items: CartItemDto[] = cartItems.map((item) => {
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

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    total,
    itemCount,
  };
};

export const updateCartItem = async (
  userId: string,
  cartItemId: string,
  quantity: number,
): Promise<CartItemDto> => {
  if (quantity < 1) {
    throw new AppError('Quantity must be at least 1', 400);
  }

  const cartItem = await models.CartItem.findOne({
    where: {
      id: cartItemId,
      userId,
    },
    include: [
      {
        model: models.Product,
        as: 'product',
        attributes: ['id', 'name', 'imageUrl'],
      },
    ],
  });

  if (!cartItem) {
    throw new AppError('Cart item not found', 404);
  }

  const productData = cartItem.get('product') as { id: string; name: string; imageUrl: string | null; stock: number };
  if (productData.stock < quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  cartItem.quantity = quantity;
  await cartItem.save();

  const updated = await models.CartItem.findByPk(cartItem.id, {
    include: [
      {
        model: models.Product,
        as: 'product',
        attributes: ['id', 'name', 'imageUrl'],
      },
    ],
  });

  if (!updated) {
    throw new AppError('Failed to retrieve cart item', 500);
  }

  const updatedProductData = updated.get('product') as { id: string; name: string; imageUrl: string | null };

  return {
    id: updated.id,
    productId: updated.productId,
    product: {
      id: updatedProductData.id,
      name: updatedProductData.name,
      imageUrl: updatedProductData.imageUrl ?? null,
    },
    quantity: updated.quantity,
    priceAtTime: Number(updated.priceAtTime),
    subtotal: Number(updated.priceAtTime) * updated.quantity,
  };
};

export const removeFromCart = async (userId: string, cartItemId: string): Promise<void> => {
  const deleted = await models.CartItem.destroy({
    where: {
      id: cartItemId,
      userId,
    },
  });

  if (!deleted) {
    throw new AppError('Cart item not found', 404);
  }
};

export const clearCart = async (userId: string): Promise<void> => {
  await models.CartItem.destroy({
    where: { userId },
  });
};


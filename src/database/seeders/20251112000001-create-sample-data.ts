import { models } from '../../database';

export default {
  up: async () => {
    // Create sample categories
    const [electronics, clothing, books] = await Promise.all([
      models.Category.findOrCreate({
        where: { name: 'Electronics' },
        defaults: {
          name: 'Electronics',
          description: 'Electronic devices and gadgets',
        },
      }),
      models.Category.findOrCreate({
        where: { name: 'Clothing' },
        defaults: {
          name: 'Clothing',
          description: 'Apparel and fashion items',
        },
      }),
      models.Category.findOrCreate({
        where: { name: 'Books' },
        defaults: {
          name: 'Books',
          description: 'Books and reading materials',
        },
      }),
    ]);

    const electronicsCategory = electronics[0];
    const clothingCategory = clothing[0];
    const booksCategory = books[0];

    // Create sample products
    await models.Product.bulkCreate(
      [
        {
          name: 'Laptop',
          description: 'High-performance laptop for work and gaming',
          price: 999.99,
          stock: 50,
          categoryId: electronicsCategory.id,
        },
        {
          name: 'Smartphone',
          description: 'Latest model smartphone with advanced features',
          price: 699.99,
          stock: 100,
          categoryId: electronicsCategory.id,
        },
        {
          name: 'T-Shirt',
          description: 'Comfortable cotton t-shirt',
          price: 19.99,
          stock: 200,
          categoryId: clothingCategory.id,
        },
        {
          name: 'Jeans',
          description: 'Classic denim jeans',
          price: 49.99,
          stock: 150,
          categoryId: clothingCategory.id,
        },
        {
          name: 'Programming Book',
          description: 'Learn TypeScript and Node.js',
          price: 39.99,
          stock: 75,
          categoryId: booksCategory.id,
        },
      ],
      {
        ignoreDuplicates: true,
      },
    );

    console.log('✓ Sample categories and products created successfully!');
  },
  down: async () => {
    // Remove sample products
    await models.Product.destroy({
      where: {
        name: ['Laptop', 'Smartphone', 'T-Shirt', 'Jeans', 'Programming Book'],
      },
    });

    // Remove sample categories
    await models.Category.destroy({
      where: {
        name: ['Electronics', 'Clothing', 'Books'],
      },
    });

    console.log('Sample data removed');
  },
};


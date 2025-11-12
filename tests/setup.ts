/// <reference types="jest" />
import { sequelize } from '../src/database';

beforeAll(async () => {
  // Initialize models and sync database for testing
  await sequelize.authenticate();
  // Use alter instead of force to preserve data structure but update schema
  await sequelize.sync({ alter: false });
});

afterAll(async () => {
  // Close database connection
  await sequelize.close();
});


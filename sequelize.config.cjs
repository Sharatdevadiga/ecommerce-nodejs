/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

const buildConfig = () => {
  const ssl = process.env.DB_SSL === 'true';
  const dialectOptions = ssl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : undefined;

  if (process.env.DATABASE_URL) {
    return {
      url: process.env.DATABASE_URL,
      dialect: 'postgres',
      dialectOptions,
      logging: false,
    };
  }

  return {
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'ecommerce',
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 5432),
    dialect: 'postgres',
    dialectOptions,
    logging: false,
  };
};

const config = buildConfig();

module.exports = {
  development: config,
  test: config,
  production: config,
};


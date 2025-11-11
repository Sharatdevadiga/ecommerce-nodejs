import { Sequelize, type Options } from 'sequelize';

import env from './env';

const buildDialectOptions = (): Options['dialectOptions'] =>
  env.database.ssl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : undefined;

export const createSequelizeInstance = (): Sequelize => {
  const dialectOptions = buildDialectOptions();

  const commonOptions: Options = {
    dialect: 'postgres' as const,
    logging: env.nodeEnv === 'development' ? console.log : false,
    ...(dialectOptions ? { dialectOptions } : {}),
  };

  if (env.database.url) {
    return new Sequelize(env.database.url, commonOptions);
  }

  return new Sequelize(env.database.name, env.database.username, env.database.password || undefined, {
    ...commonOptions,
    host: env.database.host,
    port: env.database.port,
  });
};


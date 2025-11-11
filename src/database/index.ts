import { createSequelizeInstance } from '../config/database';
import { initModels } from './models';

export const sequelize = createSequelizeInstance();
export const models = initModels(sequelize);

export const connectDatabase = async () => {
  await sequelize.authenticate();
};


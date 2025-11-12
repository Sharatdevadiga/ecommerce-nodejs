import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

import env from '../../config/env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce REST API',
      version: '1.0.0',
      description: 'A comprehensive REST API for an e-commerce platform with authentication, product management, shopping cart, and order processing.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'https://ecommerce-nodejs-hdsd.onrender.com',
        description: 'Production server',
      },
      {
        url: `http://localhost:${env.port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/docs/swagger/swagger.yaml', './src/docs/swagger/paths.yaml'],
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};


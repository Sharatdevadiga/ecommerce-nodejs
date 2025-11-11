import http from 'http';

import app from './app';
import { connectDatabase } from './database';
import env from './config/env';

const port = env.port;

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDatabase();
    server.listen(port, () => {
      console.log(`🚀 Server ready on port ${port} (${env.nodeEnv})`);
    });
  } catch (error) {
    console.error('Failed to initialize application', error);
    process.exit(1);
  }
};

const gracefulShutdown = (signal: NodeJS.Signals) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  server.close((error) => {
    if (error) {
      console.error('Error during shutdown', error);
      process.exit(1);
    }

    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

void startServer();


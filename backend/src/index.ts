import cors from '@fastify/cors';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import wsRoutes from './routes/wsRoutes';
import authRoutes from './routes/authRoutes';
import { blockRoutes } from './routes/blockRoutes';
import pageRoutes from './routes/pageRoutes';
import folderRoutes from './routes/folderRoutes';
import fileRoutes from './routes/fileRoutes';
import pluginRoutes from './routes/pluginRoutes';

const server: FastifyInstance = Fastify({
  logger: true
});

// Register plugins with more permissive CORS
server.register(cors, {
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflight: true,
  preflightContinue: false
});

// Register routes
server.register(authRoutes, { prefix: '/api/auth' });
server.register(blockRoutes, { prefix: '/api' });
server.register(pageRoutes, { prefix: '/api/pages' });
server.register(folderRoutes, { prefix: '/api/folders' });
server.register(fileRoutes, { prefix: '/api/files' });
server.register(pluginRoutes, { prefix: '/api/plugins' });
server.register(wsRoutes);

server.get('/health', async () => {
  return { status: 'ok' };
});

const PORT = Number(process.env.PORT) || 3000;

server.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
}); 
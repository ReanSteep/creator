// @ts-ignore
import cors from '@fastify/cors';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import wsRoutes from './routes/wsRoutes';

const server: FastifyInstance = Fastify();

server.register(cors, { origin: true });

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
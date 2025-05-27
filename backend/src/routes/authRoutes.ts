import { FastifyInstance } from 'fastify';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/me', async (request, reply) => {
    // TODO: Implement user info endpoint
    return { message: 'Not implemented' };
  });

  fastify.post('/magic-link', async (request, reply) => {
    // TODO: Implement magic link endpoint
    return { message: 'Not implemented' };
  });
} 
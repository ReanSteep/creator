import { FastifyInstance } from 'fastify';

export default async function blockRoutes(fastify: FastifyInstance) {
  fastify.get('/:id', async (request, reply) => {
    // TODO: Implement get block endpoint
    return { message: 'Not implemented' };
  });

  fastify.post('/', async (request, reply) => {
    // TODO: Implement create block endpoint
    return { message: 'Not implemented' };
  });

  fastify.put('/:id', async (request, reply) => {
    // TODO: Implement update block endpoint
    return { message: 'Not implemented' };
  });

  fastify.delete('/:id', async (request, reply) => {
    // TODO: Implement delete block endpoint
    return { message: 'Not implemented' };
  });
} 
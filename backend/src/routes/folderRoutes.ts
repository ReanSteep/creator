import { FastifyInstance } from 'fastify';

export default async function folderRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    // TODO: Implement list folders endpoint
    return { message: 'Not implemented' };
  });

  fastify.get('/:id', async (request, reply) => {
    // TODO: Implement get folder endpoint
    return { message: 'Not implemented' };
  });

  fastify.post('/', async (request, reply) => {
    // TODO: Implement create folder endpoint
    return { message: 'Not implemented' };
  });

  fastify.put('/:id', async (request, reply) => {
    // TODO: Implement update folder endpoint
    return { message: 'Not implemented' };
  });

  fastify.delete('/:id', async (request, reply) => {
    // TODO: Implement delete folder endpoint
    return { message: 'Not implemented' };
  });
} 
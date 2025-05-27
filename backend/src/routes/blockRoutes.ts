import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const blockSchema = z.object({
  type: z.string(),
  content: z.string(),
  layout: z.record(z.any()),
  style: z.record(z.any()),
  position: z.number()
});

export async function blockRoutes(app: FastifyInstance) {
  // Get all blocks for a page
  app.get('/pages/:pageId/blocks', async (request, reply) => {
    try {
      const { pageId } = request.params as { pageId: string };
      app.log.info(`Fetching blocks for page ${pageId}`);
      
      const blocks = await prisma.block.findMany({
        where: { pageId },
        orderBy: { position: 'asc' }
      });
      
      app.log.info(`Found ${blocks.length} blocks`);
      return blocks;
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({ error: 'Failed to fetch blocks' });
    }
  });

  // Create a new block
  app.post('/pages/:pageId/blocks', async (request, reply) => {
    try {
      const { pageId } = request.params as { pageId: string };
      const blockData = blockSchema.parse(request.body);
      app.log.info(`Creating block for page ${pageId}`);
      
      const block = await prisma.block.create({
        data: {
          ...blockData,
          pageId
        }
      });
      
      app.log.info(`Created block ${block.id}`);
      return block;
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({ error: 'Failed to create block' });
    }
  });

  // Update a block
  app.put('/blocks/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const blockData = blockSchema.parse(request.body);
      app.log.info(`Updating block ${id}`);
      
      const block = await prisma.block.update({
        where: { id },
        data: blockData
      });
      
      app.log.info(`Updated block ${id}`);
      return block;
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({ error: 'Failed to update block' });
    }
  });

  // Delete a block
  app.delete('/blocks/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      app.log.info(`Deleting block ${id}`);
      
      await prisma.block.delete({
        where: { id }
      });
      
      app.log.info(`Deleted block ${id}`);
      return { success: true };
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({ error: 'Failed to delete block' });
    }
  });

  // Reorder blocks
  app.post('/pages/:pageId/blocks/reorder', async (request, reply) => {
    try {
      const { pageId } = request.params as { pageId: string };
      const { blockIds } = request.body as { blockIds: string[] };
      app.log.info(`Reordering blocks for page ${pageId}`);
      
      // Update positions in a transaction
      await prisma.$transaction(
        blockIds.map((id, index) => 
          prisma.block.update({
            where: { id },
            data: { position: index }
          })
        )
      );
      
      app.log.info(`Reordered ${blockIds.length} blocks`);
      return { success: true };
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({ error: 'Failed to reorder blocks' });
    }
  });
} 
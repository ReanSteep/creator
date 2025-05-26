import { FastifyPluginAsync } from 'fastify';
import { supabase } from '../server';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Verify session
  fastify.get('/auth/session', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return reply.status(401).send({ error: 'Invalid token' });
    }

    return { user };
  });

  // Sign out
  fastify.post('/auth/signout', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: 'No authorization header' });
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return { success: true };
  });
};

export default authRoutes; 
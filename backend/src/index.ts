import Fastify from 'fastify';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { setupMessageWebSocket } from './websocket/messageHandler.js';
import { ready } from './crypto.js';

dotenv.config();

// Initialize libsodium
await ready();

const fastify = Fastify({
  logger: true,
});

// Register WebSocket plugin
await fastify.register(import('@fastify/websocket'));

// Health check
fastify.get('/health', async () => {
  return { status: 'ok' };
});

// Protected route example
fastify.get('/protected', async (request, reply) => {
  const auth = request.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid Authorization header' });
  }
  const token = auth.split(' ')[1];
  try {
    // For demonstration, decode the JWT (do not use in production for verification!)
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) throw new Error('Invalid token');
    // Optionally: verify claims, expiration, etc.
    return { message: 'You are authenticated!', user: decoded.payload };
  } catch (err) {
    return reply.status(401).send({ error: 'Invalid token' });
  }
});

// Setup WebSocket routes
setupMessageWebSocket(fastify);

const start = async () => {
  try {
    await fastify.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 
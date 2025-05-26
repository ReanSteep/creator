import fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

// Create Fastify instance
const server = fastify({
  logger: true,
});

// Initialize Prisma
export const prisma = new PrismaClient();

// Initialize Supabase
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Register plugins
server.register(cors, {
  origin: true,
  credentials: true,
});

server.register(websocket);

// Health check route
server.get('/health', async () => {
  return { status: 'ok' };
});

// Start server
const start = async () => {
  try {
    await server.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' });
    console.log(`Server listening on ${server.server.address()}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await server.close();
  await prisma.$disconnect();
  process.exit(0);
});

start(); 
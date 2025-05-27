import { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';

const clients = new Set<any>();

export default async function wsRoutes(fastify: FastifyInstance) {
  fastify.register(websocket);

  fastify.get('/ws', { websocket: true }, (connection /*, req */) => {
    // connection IS the WebSocket
    clients.add(connection);

    connection.on('message', (message) => {
      // Broadcast to all clients except sender
      for (const client of clients) {
        if (client !== connection && client.readyState === client.OPEN) {
          client.send(message);
        }
      }
    });

    connection.on('close', () => {
      clients.delete(connection);
    });
  });
}

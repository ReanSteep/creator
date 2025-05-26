import { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';

const clients = new Set<WebSocket>();

export default async function wsRoutes(fastify: FastifyInstance) {
  fastify.register(websocket);

  fastify.get('/ws', { websocket: true }, (connection /*, req */) => {
    clients.add(connection.socket);

    connection.socket.on('message', (message) => {
      // Broadcast to all clients except sender
      for (const client of clients) {
        if (client !== connection.socket && client.readyState === client.OPEN) {
          client.send(message);
        }
      }
    });

    connection.socket.on('close', () => {
      clients.delete(connection.socket);
    });
  });
}

import { FastifyInstance } from 'fastify';
import { MessageService } from '../services/messageService.js';
import { KeyManagementService } from '../services/keyManagement.js';

const messageService = new MessageService();
const keyManagement = new KeyManagementService();

export async function setupMessageWebSocket(fastify: FastifyInstance) {
  fastify.get('/ws/messages/:tabId', { websocket: true }, (connection, req) => {
    const tabId = req.params.tabId as string;
    const userId = req.user?.id;

    if (!userId) {
      connection.socket.close(1008, 'Unauthorized');
      return;
    }

    // Verify user has access to this tab
    keyManagement.getTabSharedKey(tabId, userId).catch(() => {
      connection.socket.close(1008, 'Unauthorized');
    });

    // Handle incoming messages
    connection.socket.on('message', async (message: string) => {
      try {
        const { content } = JSON.parse(message);
        await messageService.sendMessage(tabId, userId, content);
        
        // Broadcast to all connected clients in this tab
        fastify.websocketServer.clients.forEach((client: any) => {
          if (client.readyState === 1 && client.tabId === tabId) {
            client.send(JSON.stringify({
              type: 'message',
              senderId: userId,
              content
            }));
          }
        });
      } catch (error) {
        connection.socket.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    });

    // Handle disconnection
    connection.socket.on('close', () => {
      // Clean up if needed
    });
  });
} 
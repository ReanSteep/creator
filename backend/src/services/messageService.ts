import { PrismaClient } from '@prisma/client';
import * as crypto from '../crypto.js';
import { KeyManagementService } from './keyManagement.js';

const prisma = new PrismaClient();
const keyManagement = new KeyManagementService();

export class MessageService {
  // Send an encrypted message
  async sendMessage(tabId: string, senderId: string, message: string): Promise<void> {
    // Get the shared key for this tab
    const sharedKey = await keyManagement.getTabSharedKey(tabId, senderId);
    const nonce = crypto.randomNonce();

    // Encrypt the message
    const encryptedMessage = crypto.encryptMessage(
      new TextEncoder().encode(message),
      sharedKey,
      nonce
    );

    // Store the encrypted message
    await prisma.tabMessages.create({
      data: {
        tab_id: tabId,
        sender_id: senderId,
        ciphertext: encryptedMessage,
        nonce: nonce
      }
    });
  }

  // Get messages for a tab
  async getMessages(tabId: string, userId: string) {
    // Verify user has access to this tab
    const sharedKey = await keyManagement.getTabSharedKey(tabId, userId);

    // Get messages
    const messages = await prisma.tabMessages.findMany({
      where: { tab_id: tabId },
      orderBy: { created_at: 'asc' }
    });

    // Decrypt messages
    return messages.map(msg => {
      const decrypted = crypto.decryptMessage(
        msg.ciphertext,
        msg.nonce,
        sharedKey
      );
      return {
        id: msg.id,
        senderId: msg.sender_id,
        content: new TextDecoder().decode(decrypted),
        createdAt: msg.created_at
      };
    });
  }
} 
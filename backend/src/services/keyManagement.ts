import { PrismaClient } from '@prisma/client';
import * as crypto from '../crypto';

const prisma = new PrismaClient();

export class KeyManagementService {
  // Initialize user's keypair
  async initializeUserKeys(userId: string): Promise<void> {
    const keypair = crypto.generateKeypair();
    const salt = crypto.randomSalt();
    const nonce = crypto.randomNonce();
    
    // Encrypt private key with a passphrase (in production, this would be user's password)
    const encryptedPrivateKey = crypto.encryptPrivateKey(
      keypair.privateKey,
      'temporary-passphrase', // In production, use user's actual password
      salt,
      nonce
    );

    await prisma.userKeys.create({
      data: {
        user_id: userId,
        public_key: Buffer.from(keypair.publicKey).toString('base64'),
        encrypted_private_key: encryptedPrivateKey,
        key_version: 1
      }
    });
  }

  // Get user's keypair
  async getUserKeys(userId: string) {
    const keys = await prisma.userKeys.findFirst({
      where: { user_id: userId },
      orderBy: { key_version: 'desc' }
    });

    if (!keys) {
      throw new Error('User keys not found');
    }

    return {
      publicKey: Buffer.from(keys.public_key, 'base64'),
      encryptedPrivateKey: keys.encrypted_private_key
    };
  }

  // Create shared key for a tab
  async createTabSharedKey(tabId: string, ownerId: string, memberIds: string[]): Promise<void> {
    const symmetricKey = crypto.generateSymmetricKey();
    const ownerKeys = await this.getUserKeys(ownerId);

    // Encrypt the symmetric key for each member
    for (const memberId of memberIds) {
      const memberKeys = await this.getUserKeys(memberId);
      const nonce = crypto.randomNonce();

      const encryptedKey = crypto.encryptSymmetricKey(
        symmetricKey,
        memberKeys.publicKey,
        ownerKeys.encryptedPrivateKey,
        nonce
      );

      await prisma.tabSharedKeys.create({
        data: {
          tab_id: tabId,
          user_id: memberId,
          encrypted_key: encryptedKey,
          nonce: nonce,
          sender_pub: Buffer.from(ownerKeys.publicKey).toString('base64')
        }
      });
    }
  }

  // Get shared key for a tab
  async getTabSharedKey(tabId: string, userId: string) {
    const sharedKey = await prisma.tabSharedKeys.findUnique({
      where: {
        tab_id_user_id: {
          tab_id: tabId,
          user_id: userId
        }
      }
    });

    if (!sharedKey) {
      throw new Error('Shared key not found');
    }

    const userKeys = await this.getUserKeys(userId);
    
    return crypto.decryptSymmetricKey(
      sharedKey.encrypted_key,
      sharedKey.nonce,
      Buffer.from(sharedKey.sender_pub, 'base64'),
      userKeys.encryptedPrivateKey
    );
  }
} 
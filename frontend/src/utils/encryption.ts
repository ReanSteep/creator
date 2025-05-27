import { createClient } from '@supabase/supabase-js';
import sodium from 'libsodium-wrappers';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

interface EncryptedMessage {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
}

// Ensure sodium is initialized before any crypto operations
let sodiumReady = false;
async function ensureSodiumReady() {
  if (!sodiumReady) {
    try {
      await sodium.ready;
      sodiumReady = true;
    } catch (error) {
      console.error('Failed to initialize Libsodium:', error);
      throw new Error('Failed to initialize encryption library');
    }
  }
}

// Generate a new key pair
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  await ensureSodiumReady();
  const keyPair = sodium.crypto_box_keypair();
  return {
    publicKey: sodium.to_base64(keyPair.publicKey),
    privateKey: sodium.to_base64(keyPair.privateKey)
  };
}

// Encrypt a message using a public key
export async function encryptMessage(message: string, publicKey: string): Promise<{ encryptedMessage: string; nonce: string }> {
  await ensureSodiumReady();
  const messageBytes = sodium.from_string(message);
  const publicKeyBytes = sodium.from_base64(publicKey);
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  const encryptedMessage = sodium.crypto_box_seal(messageBytes, publicKeyBytes);
  return {
    encryptedMessage: sodium.to_base64(encryptedMessage),
    nonce: sodium.to_base64(nonce)
  };
}

// Decrypt a message using a private key
export async function decryptMessage(encryptedMessage: string, nonce: string, privateKey: string, publicKey: string): Promise<string> {
  await ensureSodiumReady();
  const encryptedBytes = sodium.from_base64(encryptedMessage);
  const nonceBytes = sodium.from_base64(nonce);
  const privateKeyBytes = sodium.from_base64(privateKey);
  const publicKeyBytes = sodium.from_base64(publicKey);
  const decryptedBytes = sodium.crypto_box_seal_open(encryptedBytes, publicKeyBytes, privateKeyBytes);
  return sodium.to_string(decryptedBytes);
}

// Generate a shared key for a chat
export async function generateSharedKey(): Promise<string> {
  await ensureSodiumReady();
  const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
  return sodium.to_base64(key);
}

// Encrypt a shared key using a public key
export async function encryptSharedKey(sharedKey: string, publicKey: string): Promise<string> {
  await ensureSodiumReady();
  const sharedKeyBytes = sodium.from_base64(sharedKey);
  const publicKeyBytes = sodium.from_base64(publicKey);
  const encryptedKey = sodium.crypto_box_seal(sharedKeyBytes, publicKeyBytes);
  return sodium.to_base64(encryptedKey);
}

// Decrypt a shared key using a private key
export async function decryptSharedKey(encryptedKey: string, privateKey: string, publicKey: string): Promise<string> {
  await ensureSodiumReady();
  const encryptedBytes = sodium.from_base64(encryptedKey);
  const privateKeyBytes = sodium.from_base64(privateKey);
  const publicKeyBytes = sodium.from_base64(publicKey);
  const decryptedBytes = sodium.crypto_box_seal_open(encryptedBytes, publicKeyBytes, privateKeyBytes);
  return sodium.to_base64(decryptedBytes);
}

// Encrypt a message using a shared key
export async function encryptMessageWithSharedKey(message: string, sharedKey: string): Promise<{ encryptedMessage: string; nonce: string }> {
  await ensureSodiumReady();
  const messageBytes = sodium.from_string(message);
  const sharedKeyBytes = sodium.from_base64(sharedKey);
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const encryptedMessage = sodium.crypto_secretbox_easy(messageBytes, nonce, sharedKeyBytes);
  return {
    encryptedMessage: sodium.to_base64(encryptedMessage),
    nonce: sodium.to_base64(nonce)
  };
}

// Decrypt a message using a shared key
export async function decryptMessageWithSharedKey(encryptedMessage: string, nonce: string, sharedKey: string): Promise<string> {
  await ensureSodiumReady();
  const encryptedBytes = sodium.from_base64(encryptedMessage);
  const nonceBytes = sodium.from_base64(nonce);
  const sharedKeyBytes = sodium.from_base64(sharedKey);
  const decryptedBytes = sodium.crypto_secretbox_open_easy(encryptedBytes, nonceBytes, sharedKeyBytes);
  return sodium.to_string(decryptedBytes);
}

// Initialize user keys with password
export async function initializeUserKeys(password: string): Promise<void> {
  try {
    await ensureSodiumReady();
    
    if (!password || typeof password !== 'string') {
      throw new Error('Invalid password');
    }

    // Generate salt and nonce
    const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    
    // Generate key pair
    const keyPair = await generateKeyPair();
    
    // Convert password to Uint8Array
    const passwordBytes = sodium.from_string(password);
    
    // Derive encryption key from password
    const key = sodium.crypto_pwhash(
      sodium.crypto_secretbox_KEYBYTES,
      passwordBytes,
      salt,
      sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_ALG_DEFAULT
    );
    
    // Convert private key to Uint8Array
    const privateKeyBytes = sodium.from_base64(keyPair.privateKey);
    
    // Encrypt private key with derived key
    const encryptedPrivateKey = sodium.crypto_secretbox_easy(
      privateKeyBytes,
      nonce,
      key
    );
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }
    
    // Store keys in Supabase
    const { error } = await supabase
      .from('user_keys')
      .insert({
        user_id: user.id,
        public_key: keyPair.publicKey,
        encrypted_private_key: sodium.to_base64(encryptedPrivateKey),
        salt: sodium.to_base64(salt),
        nonce: sodium.to_base64(nonce)
      });
    
    if (error) {
      console.error('Failed to store keys:', error);
      throw new Error('Failed to store encryption keys');
    }
  } catch (error) {
    console.error('Error in initializeUserKeys:', error);
    throw error;
  }
}

// Get user keys
export async function getUserKeys(): Promise<{ publicKey: string; privateKey: string } | null> {
  const { data: userKeys, error } = await supabase
    .from('user_keys')
    .select('*')
    .single();
  
  if (error || !userKeys) return null;
  
  return {
    publicKey: userKeys.public_key,
    privateKey: userKeys.encrypted_private_key
  };
}

// Decrypt private key with password
export async function decryptPrivateKey(encryptedPrivateKey: string, salt: string, nonce: string, password: string): Promise<string> {
  await ensureSodiumReady();
  
  // Derive key from password
  const key = sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    sodium.from_string(password),
    sodium.from_base64(salt),
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );
  
  // Decrypt private key
  const decryptedBytes = sodium.crypto_secretbox_open_easy(
    sodium.from_base64(encryptedPrivateKey),
    sodium.from_base64(nonce),
    key
  );
  
  return sodium.to_base64(decryptedBytes);
}

// Create a new chat and generate shared keys
export async function createChat(userId1: string, userId2: string): Promise<string> {
  await ensureSodiumReady();
  const chatId = `${userId1}-${userId2}`;
  const sharedKey = await generateSharedKey();

  // Get public keys for both users
  const [user1Keys, user2Keys] = await Promise.all([
    getUserKeys(),
    getUserKeys()
  ]);

  // Encrypt shared key for both users
  const encryptedKey1 = await encryptSharedKey(sharedKey, user1Keys?.publicKey || '');
  const encryptedKey2 = await encryptSharedKey(sharedKey, user2Keys?.publicKey || '');

  // Store encrypted shared keys
  const { error } = await supabase
    .from('chat_shared_keys')
    .insert([
      {
        chat_id: chatId,
        user_id: userId1,
        encrypted_shared_key: encryptedKey1
      },
      {
        chat_id: chatId,
        user_id: userId2,
        encrypted_shared_key: encryptedKey2
      }
    ]);

  if (error) throw error;
  return chatId;
}

// Send an encrypted message
export async function sendEncryptedMessage(
  chatId: string,
  senderId: string,
  receiverId: string,
  message: string
): Promise<void> {
  await ensureSodiumReady();
  // Get the shared key for this chat
  const { data: sharedKeyData, error: sharedKeyError } = await supabase
    .from('chat_shared_keys')
    .select('encrypted_shared_key')
    .eq('chat_id', chatId)
    .eq('user_id', senderId)
    .single();

  if (sharedKeyError) throw sharedKeyError;

  // Get sender's keys
  const senderKeys = await getUserKeys();

  // Decrypt the shared key
  const sharedKey = await decryptSharedKey(
    sharedKeyData.encrypted_shared_key,
    senderKeys?.privateKey || '',
    senderKeys?.publicKey || ''
  );

  // Encrypt the message
  const { encryptedMessage, nonce } = await encryptMessage(message, sharedKey);

  // Store the encrypted message
  const { error: messageError } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      encrypted_content: encryptedMessage,
      nonce: nonce
    });

  if (messageError) throw messageError;
}

// Receive and decrypt a message
export async function receiveEncryptedMessage(
  chatId: string,
  userId: string,
  messageId: string
): Promise<string> {
  await ensureSodiumReady();
  // Get the message
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .select('encrypted_content, nonce')
    .eq('id', messageId)
    .single();

  if (messageError) throw messageError;

  // Get the shared key for this chat
  const { data: sharedKeyData, error: sharedKeyError } = await supabase
    .from('chat_shared_keys')
    .select('encrypted_shared_key')
    .eq('chat_id', chatId)
    .eq('user_id', userId)
    .single();

  if (sharedKeyError) throw sharedKeyError;

  // Get user's keys
  const userKeys = await getUserKeys();

  // Decrypt the shared key
  const sharedKey = await decryptSharedKey(
    sharedKeyData.encrypted_shared_key,
    userKeys?.privateKey || '',
    userKeys?.publicKey || ''
  );

  // Decrypt the message
  return decryptMessage(
    message.encrypted_content,
    message.nonce,
    userKeys?.privateKey || '',
    sharedKey
  );
} 
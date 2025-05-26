import sodium from 'libsodium-wrappers';

// Encrypt a message with a shared key
export async function encryptMessage(message: string, sharedKey: Uint8Array): Promise<Uint8Array> {
  await sodium.ready;
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = sodium.crypto_secretbox_easy(
    sodium.from_string(message),
    nonce,
    sharedKey
  );
  // Return nonce + ciphertext
  return sodium.concat(nonce, ciphertext);
}

// Decrypt a message with a shared key
export async function decryptMessage(ciphertextWithNonce: Uint8Array, sharedKey: Uint8Array): Promise<string> {
  await sodium.ready;
  const nonce = ciphertextWithNonce.slice(0, sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = ciphertextWithNonce.slice(sodium.crypto_secretbox_NONCEBYTES);
  const decrypted = sodium.crypto_secretbox_open_easy(ciphertext, nonce, sharedKey);
  if (!decrypted) throw new Error('Decryption failed');
  return sodium.to_string(decrypted);
}

// Encrypt a file (Uint8Array) with a shared key
export async function encryptFile(fileData: Uint8Array, sharedKey: Uint8Array): Promise<Uint8Array> {
  await sodium.ready;
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = sodium.crypto_secretbox_easy(fileData, nonce, sharedKey);
  return sodium.concat(nonce, ciphertext);
}

// Decrypt a file (Uint8Array) with a shared key
export async function decryptFile(ciphertextWithNonce: Uint8Array, sharedKey: Uint8Array): Promise<Uint8Array> {
  await sodium.ready;
  const nonce = ciphertextWithNonce.slice(0, sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = ciphertextWithNonce.slice(sodium.crypto_secretbox_NONCEBYTES);
  const decrypted = sodium.crypto_secretbox_open_easy(ciphertext, nonce, sharedKey);
  if (!decrypted) throw new Error('File decryption failed');
  return decrypted;
}

import sodium from 'libsodium-wrappers';

export async function ready() {
  await sodium.ready;
}

export function generateKeypair() {
  return sodium.crypto_box_keypair();
}

export function encryptPrivateKey(privateKey: Uint8Array, passphrase: string, salt: Uint8Array, nonce: Uint8Array) {
  const key = sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    passphrase,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );
  return sodium.crypto_secretbox_easy(privateKey, nonce, key);
}

export function decryptPrivateKey(encrypted: Uint8Array, passphrase: string, salt: Uint8Array, nonce: Uint8Array) {
  const key = sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    passphrase,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );
  return sodium.crypto_secretbox_open_easy(encrypted, nonce, key);
}

export function encryptSymmetricKey(tabKey: Uint8Array, recipientPublicKey: Uint8Array, senderPrivateKey: Uint8Array, nonce: Uint8Array) {
  return sodium.crypto_box_easy(tabKey, nonce, recipientPublicKey, senderPrivateKey);
}

export function decryptSymmetricKey(encryptedKey: Uint8Array, nonce: Uint8Array, senderPublicKey: Uint8Array, recipientPrivateKey: Uint8Array) {
  return sodium.crypto_box_open_easy(encryptedKey, nonce, senderPublicKey, recipientPrivateKey);
}

export function generateSymmetricKey() {
  return sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
}

export function encryptMessage(message: Uint8Array, key: Uint8Array, nonce: Uint8Array) {
  return sodium.crypto_secretbox_easy(message, nonce, key);
}

export function decryptMessage(ciphertext: Uint8Array, nonce: Uint8Array, key: Uint8Array) {
  return sodium.crypto_secretbox_open_easy(ciphertext, nonce, key);
}

export function randomNonce() {
  return sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
}

export function randomSalt() {
  return sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
} 
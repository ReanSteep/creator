declare module 'libsodium-wrappers' {
  interface KeyPair {
    publicKey: Uint8Array;
    privateKey: Uint8Array;
  }

  const sodium: {
    ready: Promise<void>;
    crypto_box_keypair(): KeyPair;
    crypto_box_seal(message: Uint8Array, publicKey: Uint8Array): Uint8Array;
    crypto_box_seal_open(ciphertext: Uint8Array, publicKey: Uint8Array, privateKey: Uint8Array): Uint8Array;
    crypto_secretbox_easy(message: Uint8Array, nonce: Uint8Array, key: Uint8Array): Uint8Array;
    crypto_secretbox_open_easy(ciphertext: Uint8Array, nonce: Uint8Array, key: Uint8Array): Uint8Array;
    randombytes_buf(length: number): Uint8Array;
    crypto_pwhash_ALG_DEFAULT: number;
    crypto_pwhash_MEMLIMIT_INTERACTIVE: number;
    crypto_pwhash_OPSLIMIT_INTERACTIVE: number;
    crypto_pwhash_SALTBYTES: number;
    crypto_box_NONCEBYTES: number;
    crypto_secretbox_KEYBYTES: number;
    crypto_secretbox_NONCEBYTES: number;
    crypto_pwhash(
      keyLength: number,
      password: Uint8Array,
      salt: Uint8Array,
      opsLimit: number,
      memLimit: number,
      algorithm: number
    ): Uint8Array;
    crypto_pwhash_str(
      password: Uint8Array,
      opsLimit: number,
      memLimit: number
    ): string;
    crypto_pwhash_str_verify(
      hashedPassword: string,
      password: Uint8Array
    ): boolean;
    to_base64(bytes: Uint8Array): string;
    from_base64(base64: string): Uint8Array;
    to_string(bytes: Uint8Array): string;
    from_string(str: string): Uint8Array;
  };

  export default sodium;
} 
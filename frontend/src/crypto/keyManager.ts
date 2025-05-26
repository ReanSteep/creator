import sodium from 'libsodium-wrappers';

const PRIVATE_KEY_STORAGE = 'e2ee_private_key';
const PUBLIC_KEY_STORAGE = 'e2ee_public_key';

export async function generateKeyPair() {
  await sodium.ready;
  const keyPair = sodium.crypto_box_keypair();
  return keyPair;
}

export async function saveKeyPair(keyPair: { publicKey: Uint8Array; privateKey: Uint8Array }) {
  localStorage.setItem(PRIVATE_KEY_STORAGE, sodium.to_base64(keyPair.privateKey));
  localStorage.setItem(PUBLIC_KEY_STORAGE, sodium.to_base64(keyPair.publicKey));
}

export async function loadKeyPair(): Promise<{ publicKey: Uint8Array; privateKey: Uint8Array } | null> {
  await sodium.ready;
  const priv = localStorage.getItem(PRIVATE_KEY_STORAGE);
  const pub = localStorage.getItem(PUBLIC_KEY_STORAGE);
  if (!priv || !pub) return null;
  return {
    privateKey: sodium.from_base64(priv),
    publicKey: sodium.from_base64(pub),
  };
}

// X25519 key agreement: derive shared key from our private and their public
export async function getSharedKey(theirPublicKey: Uint8Array, myPrivateKey: Uint8Array): Promise<Uint8Array> {
  await sodium.ready;
  return sodium.crypto_scalarmult(myPrivateKey, theirPublicKey);
}

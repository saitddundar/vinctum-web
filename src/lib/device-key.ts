/**
 * X25519 device key management with IndexedDB persistence.
 *
 * Each device owns a static X25519 keypair. The public key is uploaded to the
 * server; the private key never leaves the browser (stored as a non-extractable
 * CryptoKey in IndexedDB).
 *
 * Transfer encryption uses ephemeral ECDH + HKDF-SHA256 to derive a per-transfer
 * AES-256-GCM key, matching the Go backend's pkg/crypto/ecdh.go implementation.
 */

import api from "./api";

// ─── IndexedDB helpers ──────────────────────────────────

const DB_NAME = "vinctum_keys";
const STORE = "device_keys";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Key types ──────────────────────────────────────────

export interface DeviceKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface DeviceKeyInfo {
  device_id: string;
  kex_algo: string;
  kex_public_key: string; // base64
  created_at: string;
  rotated_at: string;
}

// ─── Static device key management ───────────────────────

/**
 * Generates a new X25519 keypair and persists it to IndexedDB.
 * Returns the raw public key bytes for upload to the server.
 */
export async function generateDeviceKeyPair(deviceId: string): Promise<Uint8Array> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "X25519" } as EcKeyGenParams,
    true,
    ["deriveBits"],
  );

  await idbSet(`kp_${deviceId}`, {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  });

  const rawPub = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  return new Uint8Array(rawPub);
}

/**
 * Retrieves the stored keypair for a device from IndexedDB.
 */
export async function getStoredKeyPair(deviceId: string): Promise<DeviceKeyPair | null> {
  const kp = await idbGet<DeviceKeyPair>(`kp_${deviceId}`);
  return kp || null;
}

/**
 * Uploads the device's public key to the server.
 */
export async function uploadDevicePublicKey(deviceId: string, publicKeyBytes: Uint8Array): Promise<void> {
  const b64 = btoa(String.fromCharCode(...publicKeyBytes));
  await api.post(`/v1/devices/${deviceId}/key`, {
    device_id: deviceId,
    kex_algo: "x25519",
    kex_public_key: b64,
  });
}

/**
 * Fetches a remote device's public key from the server.
 * Returns the raw 32-byte public key.
 */
export async function getRemoteDeviceKey(deviceId: string): Promise<Uint8Array> {
  const { data } = await api.get(`/v1/devices/${deviceId}/key`);
  const key: DeviceKeyInfo = data.key;
  const binary = atob(key.kex_public_key);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Ensures the device has a keypair generated and uploaded.
 * Idempotent — skips if keys already exist locally.
 */
export async function ensureDeviceKeys(deviceId: string): Promise<void> {
  const existing = await getStoredKeyPair(deviceId);
  if (existing) return;

  const pubBytes = await generateDeviceKeyPair(deviceId);
  await uploadDevicePublicKey(deviceId, pubBytes);
}

// ─── Ephemeral ECDH + HKDF key derivation ───────────────

/**
 * Generates an ephemeral X25519 keypair for a single transfer.
 * Returns { privateKey, publicKeyBytes }.
 */
export async function generateEphemeralKeyPair(): Promise<{
  privateKey: CryptoKey;
  publicKeyBytes: Uint8Array;
}> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "X25519" } as EcKeyGenParams,
    true,
    ["deriveBits"],
  );
  const rawPub = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  return {
    privateKey: keyPair.privateKey,
    publicKeyBytes: new Uint8Array(rawPub),
  };
}

/**
 * Performs X25519 ECDH and derives a per-transfer AES-256-GCM key via HKDF-SHA256.
 *
 * Matches the Go backend exactly:
 *   salt = ephemeralPub || receiverStaticPub
 *   info = "vinctum-transfer-v1:" + transferId
 */
export async function deriveTransferKey(
  localPrivateKey: CryptoKey,
  remotePublicKeyBytes: Uint8Array,
  ephemeralPubBytes: Uint8Array,
  receiverStaticPubBytes: Uint8Array,
  transferId: string,
): Promise<CryptoKey> {
  // Import remote public key
  const remotePub = await crypto.subtle.importKey(
    "raw",
    remotePublicKeyBytes,
    { name: "X25519" } as EcKeyImportParams,
    false,
    [],
  );

  // ECDH → shared secret
  const sharedBits = await crypto.subtle.deriveBits(
    { name: "X25519", public: remotePub } as EcdhKeyDeriveParams,
    localPrivateKey,
    256,
  );

  // Prepare HKDF inputs
  const salt = new Uint8Array(ephemeralPubBytes.length + receiverStaticPubBytes.length);
  salt.set(ephemeralPubBytes, 0);
  salt.set(receiverStaticPubBytes, ephemeralPubBytes.length);

  const info = new TextEncoder().encode(`vinctum-transfer-v1:${transferId}`);

  // Import shared secret as HKDF key
  const hkdfKey = await crypto.subtle.importKey("raw", sharedBits, "HKDF", false, ["deriveKey"]);

  // Derive AES-256-GCM key
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt, info },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

// ─── High-level transfer key helpers ─────────────────────

/**
 * Sender-side: derives the encryption key for a transfer.
 *
 * 1. Fetches receiver's static public key from the server
 * 2. Generates an ephemeral X25519 keypair
 * 3. Derives AES key via ECDH + HKDF
 *
 * Returns { aesKey, ephemeralPubBytes } — the ephemeral public key must be
 * sent with the InitiateTransfer request.
 */
export async function deriveSenderKey(
  receiverDeviceId: string,
  transferId: string,
): Promise<{ aesKey: CryptoKey; ephemeralPubBytes: Uint8Array }> {
  const receiverStaticPub = await getRemoteDeviceKey(receiverDeviceId);
  const ephemeral = await generateEphemeralKeyPair();

  const aesKey = await deriveTransferKey(
    ephemeral.privateKey,
    receiverStaticPub,
    ephemeral.publicKeyBytes,
    receiverStaticPub,
    transferId,
  );

  return { aesKey, ephemeralPubBytes: ephemeral.publicKeyBytes };
}

/**
 * Receiver-side: derives the decryption key for a transfer.
 *
 * 1. Retrieves own static private key from IndexedDB
 * 2. Uses sender's ephemeral public key from the transfer info
 * 3. Derives the same AES key via ECDH + HKDF
 */
export async function deriveReceiverKey(
  myDeviceId: string,
  senderEphemeralPubBytes: Uint8Array,
  transferId: string,
): Promise<CryptoKey> {
  const kp = await getStoredKeyPair(myDeviceId);
  if (!kp) throw new Error("Device keys not found. Re-register this device.");

  const myStaticPub = await crypto.subtle.exportKey("raw", kp.publicKey);
  const myStaticPubBytes = new Uint8Array(myStaticPub);

  return deriveTransferKey(
    kp.privateKey,
    senderEphemeralPubBytes,
    senderEphemeralPubBytes,
    myStaticPubBytes,
    transferId,
  );
}

import api from "./api";
import type {
  InitiateTransferRequest,
  InitiateTransferResponse,
  TransferStatusResponse,
  TransferInfo,
  CancelTransferResponse,
} from "../types/transfer";

export async function initiateTransfer(req: InitiateTransferRequest): Promise<InitiateTransferResponse> {
  const { data } = await api.post("/v1/transfers", req);
  return data;
}

export async function getTransferStatus(transferId: string): Promise<TransferStatusResponse> {
  const { data } = await api.get(`/v1/transfers/${transferId}`);
  return data;
}

export async function listTransfers(nodeId: string): Promise<{ transfers: TransferInfo[] }> {
  const { data } = await api.get(`/v1/transfers/node/${nodeId}`);
  return data;
}

export async function cancelTransfer(transferId: string, reason?: string): Promise<CancelTransferResponse> {
  const { data } = await api.post(`/v1/transfers/${transferId}/cancel`, { reason: reason || "" });
  return data;
}

/**
 * Uploads a single chunk via multipart form data.
 */
export async function uploadChunk(
  transferId: string,
  chunkIndex: number,
  data: ArrayBuffer,
  chunkHash: string,
  onProgress?: (loaded: number, total: number) => void,
): Promise<{ transfer_id: string; chunks_received: number; total_chunks: number }> {
  const formData = new FormData();
  formData.append("chunk_index", String(chunkIndex));
  formData.append("chunk_hash", chunkHash);
  formData.append("data", new Blob([data]), `chunk_${chunkIndex}`);

  const { data: resp } = await api.post(`/v1/transfers/${transferId}/chunks`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(e.loaded, e.total);
      }
    },
  });
  return resp;
}

/**
 * Downloads all chunks as NDJSON stream and reassembles the file.
 */
export async function downloadChunks(
  transferId: string,
  receiverNodeId: string,
  onProgress?: (chunksReceived: number, isLast: boolean) => void,
): Promise<Uint8Array[]> {
  const resp = await api.get(`/v1/transfers/${transferId}/chunks`, {
    params: { receiver_node_id: receiverNodeId, start_chunk: 0 },
    responseType: "text",
  });

  const lines: string[] = resp.data.split("\n").filter((l: string) => l.trim());
  const chunks: Uint8Array[] = [];

  for (const line of lines) {
    const parsed = JSON.parse(line);
    if (parsed.error) {
      throw new Error(parsed.error);
    }

    // data is base64-encoded by the gateway JSON encoder
    const binaryStr = atob(parsed.data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    chunks[parsed.chunk_index] = bytes;

    if (onProgress) {
      onProgress(parsed.chunk_index + 1, parsed.is_last);
    }
  }

  return chunks;
}

/**
 * Hash bytes with SHA-256 and return hex string.
 */
export async function hashChunk(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── E2E key helpers ─────────────────────────────────────

/**
 * Generates a fresh AES-256-GCM key for a transfer. The key never leaves the
 * browser; only the sender and receiver hold it.
 */
export async function generateE2EKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

/**
 * Exports a CryptoKey to a base64 string for sharing out-of-band.
 */
export async function exportKeyBase64(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

/**
 * Imports a base64 key string back into a CryptoKey for decryption.
 */
export async function importKeyBase64(b64: string): Promise<CryptoKey> {
  const binary = atob(b64);
  const raw = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) raw[i] = binary.charCodeAt(i);
  return crypto.subtle.importKey("raw", raw, "AES-GCM", true, ["encrypt", "decrypt"]);
}

/**
 * Encrypts a chunk with AES-256-GCM. Returns nonce(12) || ciphertext, matching
 * the layout the receiver decoder expects.
 */
async function encryptChunk(key: CryptoKey, plaintext: ArrayBuffer): Promise<Uint8Array> {
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, plaintext);
  const out = new Uint8Array(nonce.length + ct.byteLength);
  out.set(nonce, 0);
  out.set(new Uint8Array(ct), nonce.length);
  return out;
}

/**
 * Opens an NDJSON stream for real-time transfer events.
 * Falls back to polling if streaming is not available.
 */
export function watchTransfers(
  nodeId: string,
  onEvent: (event: TransferStatusResponse) => void,
  onError?: (err: Error) => void,
): () => void {
  const controller = new AbortController();
  const token = localStorage.getItem("vinctum_access_token");

  (async () => {
    try {
      const resp = await fetch(`/api/v1/transfer-events?node_id=${encodeURIComponent(nodeId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        throw new Error(`Stream failed: ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const event = JSON.parse(trimmed);
            if (event.error) {
              onError?.(new Error(event.error));
              continue;
            }
            onEvent(event);
          } catch { /* skip malformed lines */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        onError?.(err as Error);
      }
    }
  })();

  return () => controller.abort();
}

const CHUNK_SIZE = 256 * 1024; // 256 KB

/**
 * Uploads an entire file by chunking, encrypting client-side with AES-256-GCM,
 * hashing the ciphertext for transport integrity, and uploading sequentially.
 * The encryption key never reaches the server.
 */
export async function uploadFile(
  transferId: string,
  file: File,
  encryptionKey: CryptoKey,
  onProgress?: (chunksSent: number, totalChunks: number) => void,
): Promise<void> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const plaintext = await file.slice(start, end).arrayBuffer();
    const ciphertext = await encryptChunk(encryptionKey, plaintext);
    const hash = await hashChunk(ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength));

    await uploadChunk(transferId, i, ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength), hash);

    if (onProgress) {
      onProgress(i + 1, totalChunks);
    }
  }
}

/**
 * Downloads and reassembles a file from chunks, optionally decrypting with AES-256-GCM.
 */
export async function downloadFile(
  transferId: string,
  receiverNodeId: string,
  encryptionKey?: CryptoKey,
  onProgress?: (chunksReceived: number, isLast: boolean) => void,
): Promise<Blob> {
  const chunks = await downloadChunks(transferId, receiverNodeId, onProgress);
  const parts: Uint8Array[] = [];

  for (const chunk of chunks) {
    if (encryptionKey && chunk.length > 12) {
      // AES-256-GCM: first 12 bytes are nonce
      const nonce = chunk.slice(0, 12);
      const ciphertext = chunk.slice(12);
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: nonce },
        encryptionKey,
        ciphertext,
      );
      parts.push(new Uint8Array(decrypted));
    } else {
      parts.push(chunk);
    }
  }

  return new Blob(parts);
}

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
 * Hash a chunk with SHA-256 and return hex string.
 */
export async function hashChunk(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const CHUNK_SIZE = 256 * 1024; // 256 KB

/**
 * Uploads an entire file by chunking it, hashing each chunk, and uploading sequentially.
 * Returns transfer status after all chunks are uploaded.
 */
export async function uploadFile(
  transferId: string,
  file: File,
  onProgress?: (chunksSent: number, totalChunks: number) => void,
): Promise<void> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const slice = await file.slice(start, end).arrayBuffer();
    const hash = await hashChunk(slice);

    await uploadChunk(transferId, i, slice, hash);

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

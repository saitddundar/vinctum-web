export type TransferStatus =
  | "TRANSFER_STATUS_UNSPECIFIED"
  | "TRANSFER_STATUS_PENDING"
  | "TRANSFER_STATUS_IN_PROGRESS"
  | "TRANSFER_STATUS_COMPLETED"
  | "TRANSFER_STATUS_FAILED"
  | "TRANSFER_STATUS_CANCELLED";

export interface InitiateTransferRequest {
  sender_node_id: string;
  receiver_node_id: string;
  filename: string;
  total_size_bytes: number;
  content_hash: string;
  // encryption_key intentionally omitted: chunks are E2E encrypted client-side
  // and the key never leaves the browser. The server rejects this field.
  chunk_size_bytes?: number;
  replication_factor?: number;
  sender_ephemeral_pubkey?: string; // base64 encoded 32-byte X25519 public key
}

export interface RouteHop {
  node_id: string;
  address: string;
  latency_ms: number;
  is_relay: boolean;
}

export interface InitiateTransferResponse {
  transfer_id: string;
  total_chunks: number;
  status: TransferStatus;
  created_at: string;
  route_hops: RouteHop[];
  sender_ephemeral_pubkey?: string; // base64, echoed back for verification
}

export interface TransferStatusResponse {
  transfer_id: string;
  status: TransferStatus;
  chunks_transferred: number;
  total_chunks: number;
  bytes_transferred: number;
  total_bytes: number;
  started_at: string;
  updated_at: string;
  sender_ephemeral_pubkey?: string; // base64, for receiver-side key derivation
}

export interface TransferInfo {
  transfer_id: string;
  sender_node_id: string;
  receiver_node_id: string;
  filename: string;
  total_size_bytes: number;
  status: TransferStatus;
  progress_percent: number;
  created_at: string;
  sender_ephemeral_pubkey?: string; // base64, for receiver-side key derivation
}

export interface CancelTransferResponse {
  success: boolean;
  message: string;
}

import api from "./api";

export interface AdminUser {
  user_id: string;
  username: string;
  email: string;
  email_verified: boolean;
  created_at: string;
}

export interface AdminDevice {
  device_id: string;
  user_id: string;
  name: string;
  device_type: number;
  node_id: string;
  is_approved: boolean;
  is_revoked: boolean;
  is_public: boolean;
  owner_username: string;
  owner_email: string;
  last_active: string;
  created_at: string;
}

export interface AdminTransfer {
  transfer_id: string;
  sender_node_id: string;
  receiver_node_id: string;
  filename: string;
  total_size_bytes: number;
  status: number;
  chunks_done: number;
  total_chunks: number;
  content_hash: string;
  transfer_mode: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: number;
  user_id: string;
  method: string;
  code: string;
  peer_addr: string;
  duration_ms: number;
  created_at: string;
}

export interface ServiceStatus {
  name: string;
  healthy: boolean;
  address: string;
  latency_ms: number;
}

export async function adminListUsers(limit = 50, offset = 0) {
  const { data } = await api.get(`/v1/admin/users?limit=${limit}&offset=${offset}`);
  return data as { users: AdminUser[]; total: number };
}

export async function adminListDevices(limit = 50, offset = 0) {
  const { data } = await api.get(`/v1/admin/devices?limit=${limit}&offset=${offset}`);
  return data as { devices: AdminDevice[]; total: number };
}

export async function adminListTransfers(limit = 50, offset = 0) {
  const { data } = await api.get(`/v1/admin/transfers?limit=${limit}&offset=${offset}`);
  return data as { transfers: AdminTransfer[]; total: number };
}

export async function adminListAuditLogs(limit = 50, offset = 0) {
  const { data } = await api.get(`/v1/admin/audit-logs?limit=${limit}&offset=${offset}`);
  return data as { logs: AuditLogEntry[]; total: number };
}

export async function adminGetServices() {
  const { data } = await api.get("/v1/admin/services");
  return data as { services: ServiceStatus[] };
}

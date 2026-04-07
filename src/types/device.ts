export type DeviceType = "pc" | "phone" | "tablet";

export interface Device {
  device_id: string;
  user_id: string;
  name: string;
  device_type: DeviceType;
  node_id: string;
  fingerprint: string;
  is_approved: boolean;
  approved_at: string;
  approved_by_device_id: string;
  last_active: string;
  created_at: string;
  is_revoked: boolean;
}

export interface PeerSession {
  session_id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  devices: Device[];
  created_at: string;
  closed_at: string;
}

export interface PairingCode {
  pairing_code: string;
  expires_in_s: number;
}

export interface RegisterDeviceRequest {
  name: string;
  device_type: DeviceType;
  fingerprint: string;
  node_id?: string;
}

export interface RedeemPairingCodeRequest {
  pairing_code: string;
  name: string;
  device_type: DeviceType;
  fingerprint: string;
  node_id?: string;
}

export interface ApprovePairingRequest {
  approver_device_id: string;
  pending_device_id: string;
  approve: boolean;
}

export interface CreatePeerSessionRequest {
  name: string;
  device_id: string;
}

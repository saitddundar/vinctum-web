export type DeviceTypeShort = "pc" | "phone" | "tablet";
export type DeviceTypeProto =
  | "DEVICE_TYPE_UNSPECIFIED"
  | "DEVICE_TYPE_PC"
  | "DEVICE_TYPE_PHONE"
  | "DEVICE_TYPE_TABLET";
export type DeviceType = DeviceTypeShort | DeviceTypeProto;

const protoToShort: Record<string, DeviceTypeShort> = {
  DEVICE_TYPE_PC: "pc",
  DEVICE_TYPE_PHONE: "phone",
  DEVICE_TYPE_TABLET: "tablet",
  DEVICE_TYPE_UNSPECIFIED: "pc",
};

const shortToProto: Record<DeviceTypeShort, DeviceTypeProto> = {
  pc: "DEVICE_TYPE_PC",
  phone: "DEVICE_TYPE_PHONE",
  tablet: "DEVICE_TYPE_TABLET",
};

export function normalizeDeviceType(t: DeviceType): DeviceTypeShort {
  if (t in protoToShort) return protoToShort[t];
  return t as DeviceTypeShort;
}

export function toProtoDeviceType(t: DeviceTypeShort): DeviceTypeProto {
  return shortToProto[t];
}

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
  is_public: boolean;
}

export interface Friend {
  user_id: string;
  username: string;
  display_name: string;
  added_at: string;
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
  is_public?: boolean;
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

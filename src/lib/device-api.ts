import api from "./api";
import type {
  Device,
  Friend,
  PeerSession,
  PairingCode,
  RegisterDeviceRequest,
  RedeemPairingCodeRequest,
  ApprovePairingRequest,
  CreatePeerSessionRequest,
} from "../types/device";

export async function registerDevice(req: RegisterDeviceRequest): Promise<{ device: Device }> {
  const { data } = await api.post("/v1/devices", req);
  return data;
}

export async function listDevices(): Promise<{ devices: Device[] }> {
  const { data } = await api.get("/v1/devices");
  return data;
}

export async function getDevice(deviceId: string): Promise<{ device: Device }> {
  const { data } = await api.get(`/v1/devices/${deviceId}`);
  return data;
}

export async function revokeDevice(deviceId: string): Promise<{ success: boolean }> {
  const { data } = await api.delete(`/v1/devices/${deviceId}`);
  return data;
}

export async function updateDeviceActivity(deviceId: string, nodeId: string): Promise<void> {
  await api.put(`/v1/devices/${deviceId}/activity`, { node_id: nodeId });
}

export async function generatePairingCode(deviceId: string): Promise<PairingCode> {
  const { data } = await api.post("/v1/devices/pairing/generate", { device_id: deviceId });
  return data;
}

export async function redeemPairingCode(req: RedeemPairingCodeRequest): Promise<{ device_id: string; approver_device: string }> {
  const { data } = await api.post("/v1/devices/pairing/redeem", req);
  return data;
}

export async function approvePairing(req: ApprovePairingRequest): Promise<{ success: boolean; device: Device }> {
  const { data } = await api.post("/v1/devices/pairing/approve", req);
  return data;
}

export async function createPeerSession(req: CreatePeerSessionRequest): Promise<{ session: PeerSession }> {
  const { data } = await api.post("/v1/sessions", req);
  return data;
}

export async function listPeerSessions(): Promise<{ sessions: PeerSession[] }> {
  const { data } = await api.get("/v1/sessions");
  return data;
}

export async function closePeerSession(sessionId: string): Promise<{ success: boolean }> {
  const { data } = await api.post(`/v1/sessions/${sessionId}/close`);
  return data;
}

export async function joinPeerSession(sessionId: string, deviceId: string): Promise<{ success: boolean }> {
  const { data } = await api.post(`/v1/sessions/${sessionId}/join`, { device_id: deviceId });
  return data;
}

export async function leavePeerSession(sessionId: string, deviceId: string): Promise<{ success: boolean }> {
  const { data } = await api.post(`/v1/sessions/${sessionId}/leave`, { device_id: deviceId });
  return data;
}

export async function updateDeviceVisibility(deviceId: string, isPublic: boolean): Promise<{ success: boolean }> {
  const { data } = await api.put(`/v1/devices/${deviceId}/visibility`, { is_public: isPublic });
  return data;
}

export async function listFriends(): Promise<{ friends: Friend[] }> {
  const { data } = await api.get("/v1/friends");
  return data;
}

export async function getFriendDevices(userId: string): Promise<{ devices: Device[] }> {
  const { data } = await api.get(`/v1/friends/${userId}/devices`);
  return data;
}

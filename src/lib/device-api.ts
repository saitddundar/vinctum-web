import type {
  Device,
  PeerSession,
  PairingCode,
  RegisterDeviceRequest,
  RedeemPairingCodeRequest,
  ApprovePairingRequest,
  CreatePeerSessionRequest,
} from "../types/device";

const MOCK = true;

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

let mockDeviceIdCounter = 0;
const mockDevices: Device[] = [
  {
    device_id: "dev-1",
    user_id: "mock-user-1",
    name: "Desktop PC",
    device_type: "pc",
    node_id: "",
    fingerprint: "fp-abc123",
    is_approved: true,
    approved_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    approved_by_device_id: "",
    last_active: new Date(Date.now() - 60000).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    is_revoked: false,
  },
  {
    device_id: "dev-2",
    user_id: "mock-user-1",
    name: "iPhone 15",
    device_type: "phone",
    node_id: "",
    fingerprint: "fp-def456",
    is_approved: true,
    approved_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    approved_by_device_id: "dev-1",
    last_active: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    is_revoked: false,
  },
];

const mockSessions: PeerSession[] = [
  {
    session_id: "sess-1",
    user_id: "mock-user-1",
    name: "Work Session",
    is_active: true,
    devices: mockDevices,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    closed_at: "",
  },
];

export async function registerDevice(req: RegisterDeviceRequest): Promise<{ device: Device }> {
  if (MOCK) {
    await delay();
    const dev: Device = {
      device_id: `dev-${++mockDeviceIdCounter + 10}`,
      user_id: "mock-user-1",
      name: req.name,
      device_type: req.device_type,
      node_id: req.node_id || "",
      fingerprint: req.fingerprint,
      is_approved: true,
      approved_at: new Date().toISOString(),
      approved_by_device_id: "",
      last_active: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_revoked: false,
    };
    mockDevices.push(dev);
    return { device: dev };
  }
  const { default: api } = await import("./api");
  const { data } = await api.post("/v1/devices", req);
  return data;
}

export async function listDevices(): Promise<{ devices: Device[] }> {
  if (MOCK) {
    await delay();
    return { devices: mockDevices.filter((d) => !d.is_revoked) };
  }
  const { default: api } = await import("./api");
  const { data } = await api.get("/v1/devices");
  return data;
}

export async function revokeDevice(deviceId: string): Promise<{ success: boolean }> {
  if (MOCK) {
    await delay();
    const dev = mockDevices.find((d) => d.device_id === deviceId);
    if (dev) dev.is_revoked = true;
    return { success: true };
  }
  const { default: api } = await import("./api");
  const { data } = await api.delete(`/v1/devices/${deviceId}`);
  return data;
}

export async function generatePairingCode(deviceId: string): Promise<PairingCode> {
  if (MOCK) {
    await delay();
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return { pairing_code: code, expires_in_s: 300 };
  }
  const { default: api } = await import("./api");
  const { data } = await api.post("/v1/devices/pairing/generate", { device_id: deviceId });
  return data;
}

export async function redeemPairingCode(req: RedeemPairingCodeRequest): Promise<{ device_id: string; approver_device: string }> {
  if (MOCK) {
    await delay();
    const dev: Device = {
      device_id: `dev-${++mockDeviceIdCounter + 10}`,
      user_id: "mock-user-1",
      name: req.name,
      device_type: req.device_type,
      node_id: "",
      fingerprint: req.fingerprint,
      is_approved: false,
      approved_at: "",
      approved_by_device_id: "",
      last_active: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_revoked: false,
    };
    mockDevices.push(dev);
    return { device_id: dev.device_id, approver_device: "dev-1" };
  }
  const { default: api } = await import("./api");
  const { data } = await api.post("/v1/devices/pairing/redeem", req);
  return data;
}

export async function approvePairing(req: ApprovePairingRequest): Promise<{ success: boolean; device: Device }> {
  if (MOCK) {
    await delay();
    const dev = mockDevices.find((d) => d.device_id === req.pending_device_id);
    if (dev) {
      if (req.approve) {
        dev.is_approved = true;
        dev.approved_at = new Date().toISOString();
        dev.approved_by_device_id = req.approver_device_id;
      } else {
        dev.is_revoked = true;
      }
    }
    return { success: true, device: dev! };
  }
  const { default: api } = await import("./api");
  const { data } = await api.post("/v1/devices/pairing/approve", req);
  return data;
}

export async function createPeerSession(req: CreatePeerSessionRequest): Promise<{ session: PeerSession }> {
  if (MOCK) {
    await delay();
    const session: PeerSession = {
      session_id: `sess-${Date.now()}`,
      user_id: "mock-user-1",
      name: req.name,
      is_active: true,
      devices: mockDevices.filter((d) => d.device_id === req.device_id),
      created_at: new Date().toISOString(),
      closed_at: "",
    };
    mockSessions.push(session);
    return { session };
  }
  const { default: api } = await import("./api");
  const { data } = await api.post("/v1/sessions", req);
  return data;
}

export async function listPeerSessions(): Promise<{ sessions: PeerSession[] }> {
  if (MOCK) {
    await delay();
    return { sessions: mockSessions.filter((s) => s.is_active) };
  }
  const { default: api } = await import("./api");
  const { data } = await api.get("/v1/sessions");
  return data;
}

export async function closePeerSession(sessionId: string): Promise<{ success: boolean }> {
  if (MOCK) {
    await delay();
    const s = mockSessions.find((s) => s.session_id === sessionId);
    if (s) {
      s.is_active = false;
      s.closed_at = new Date().toISOString();
    }
    return { success: true };
  }
  const { default: api } = await import("./api");
  const { data } = await api.post(`/v1/sessions/${sessionId}/close`);
  return data;
}

export async function joinPeerSession(sessionId: string, deviceId: string): Promise<{ success: boolean }> {
  if (MOCK) {
    await delay();
    const s = mockSessions.find((s) => s.session_id === sessionId);
    const d = mockDevices.find((d) => d.device_id === deviceId);
    if (s && d && !s.devices.find((x) => x.device_id === deviceId)) {
      s.devices.push(d);
    }
    return { success: true };
  }
  const { default: api } = await import("./api");
  const { data } = await api.post(`/v1/sessions/${sessionId}/join`, { device_id: deviceId });
  return data;
}

export async function leavePeerSession(sessionId: string, deviceId: string): Promise<{ success: boolean }> {
  if (MOCK) {
    await delay();
    const s = mockSessions.find((s) => s.session_id === sessionId);
    if (s) {
      s.devices = s.devices.filter((d) => d.device_id !== deviceId);
    }
    return { success: true };
  }
  const { default: api } = await import("./api");
  const { data } = await api.post(`/v1/sessions/${sessionId}/leave`, { device_id: deviceId });
  return data;
}

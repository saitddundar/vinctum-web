import api from "./api";

export type PresenceInfo = {
  user_id: string;
  device_id: string;
  online: boolean;
};

export async function sendHeartbeat(deviceId: string): Promise<void> {
  await api.post("/v1/presence/heartbeat", { device_id: deviceId });
}

export async function getPresenceBulk(userIds: string[]): Promise<{ presence: PresenceInfo[] }> {
  const { data } = await api.post("/v1/presence/bulk", { user_ids: userIds });
  return data;
}

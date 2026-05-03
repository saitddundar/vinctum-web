import api from "./api";
import type { Friend, UserInfo, NotificationCount } from "../types/friend";
import type { Device } from "../types/device";

export async function searchUsers(query: string): Promise<UserInfo[]> {
  const { data } = await api.get(`/v1/users/search?q=${encodeURIComponent(query)}`);
  return data.users || [];
}

export async function sendFriendRequest(addresseeUserId: string): Promise<Friend> {
  const { data } = await api.post("/v1/friends/request", {
    addressee_user_id: addresseeUserId,
  });
  return data.friendship;
}

export async function respondToFriendRequest(friendshipId: string, accept: boolean): Promise<Friend> {
  const { data } = await api.post("/v1/friends/respond", {
    friendship_id: friendshipId,
    accept,
  });
  return data.friendship;
}

export async function listFriends(): Promise<Friend[]> {
  const { data } = await api.get("/v1/friends");
  return data.friends || [];
}

export async function listFriendRequests(): Promise<Friend[]> {
  const { data } = await api.get("/v1/friends/requests");
  return data.requests || [];
}

export async function removeFriend(friendshipId: string): Promise<void> {
  await api.delete(`/v1/friends/${friendshipId}`);
}

export async function getFriendDevices(userId: string): Promise<Device[]> {
  const { data } = await api.get(`/v1/friends/${userId}/devices`);
  return data.devices || [];
}

export async function getNotificationCount(): Promise<NotificationCount> {
  const { data } = await api.get("/v1/notifications/count");
  return data;
}

export async function respondToTransfer(
  transferId: string,
  receiverNodeId: string,
  accept: boolean
): Promise<void> {
  await api.post(`/v1/transfers/${transferId}/respond`, {
    receiver_node_id: receiverNodeId,
    accept,
  });
}

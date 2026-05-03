import { useEffect, useState } from "react";
import { Search, UserPlus, UserMinus, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  searchUsers,
  sendFriendRequest,
  respondToFriendRequest,
  listFriends,
  listFriendRequests,
  removeFriend,
} from "../lib/friend-api";
import { useNotifications } from "../context/NotificationContext";
import type { Friend, UserInfo } from "../types/friend";

type Tab = "friends" | "requests" | "search";

export default function Friends() {
  const { refresh: refreshNotifications } = useNotifications();
  const [tab, setTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [searchResults, setSearchResults] = useState<UserInfo[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  async function loadFriends() {
    try {
      setFriends(await listFriends());
    } catch {
      toast.error("Failed to load friends");
    }
  }

  async function loadRequests() {
    try {
      setRequests(await listFriendRequests());
    } catch {
      toast.error("Failed to load friend requests");
    }
  }

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      setSearchResults(await searchUsers(query.trim()));
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendRequest(userId: string) {
    try {
      await sendFriendRequest(userId);
      toast.success("Friend request sent");
      setSearchResults((prev) => prev.filter((u) => u.user_id !== userId));
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to send request");
    }
  }

  async function handleRespond(friendshipId: string, accept: boolean) {
    try {
      await respondToFriendRequest(friendshipId, accept);
      toast.success(accept ? "Friend request accepted" : "Friend request rejected");
      setRequests((prev) => prev.filter((r) => r.id !== friendshipId));
      if (accept) loadFriends();
      refreshNotifications();
    } catch {
      toast.error("Failed to respond");
    }
  }

  async function handleRemove(friendshipId: string) {
    try {
      await removeFriend(friendshipId);
      toast.success("Friend removed");
      setFriends((prev) => prev.filter((f) => f.id !== friendshipId));
    } catch {
      toast.error("Failed to remove friend");
    }
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "friends", label: "Friends", count: friends.length },
    { key: "requests", label: "Requests", count: requests.length },
    { key: "search", label: "Search" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-100">Friends</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-900/50 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm transition-all ${
              tab === t.key
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1.5 text-xs opacity-60">({t.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Friends List */}
      {tab === "friends" && (
        <div className="space-y-2">
          {friends.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">
              No friends yet. Search for users to add!
            </p>
          ) : (
            friends.map((f) => (
              <div
                key={f.id}
                className="glass-card-static flex items-center justify-between p-4 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-200">{f.user.username}</p>
                  <p className="text-xs text-gray-500">{f.user.email}</p>
                </div>
                <button
                  onClick={() => handleRemove(f.id)}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  title="Remove friend"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Requests */}
      {tab === "requests" && (
        <div className="space-y-2">
          {requests.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">
              No pending friend requests.
            </p>
          ) : (
            requests.map((r) => (
              <div
                key={r.id}
                className="glass-card-static flex items-center justify-between p-4 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-200">{r.user.username}</p>
                  <p className="text-xs text-gray-500">{r.user.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(r.id, true)}
                    className="p-2 text-gray-400 hover:text-emerald-400 bg-emerald-500/10 rounded-md transition-colors"
                    title="Accept"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRespond(r.id, false)}
                    className="p-2 text-gray-400 hover:text-red-400 bg-red-500/10 rounded-md transition-colors"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Search */}
      {tab === "search" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by username..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-800/50 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-emerald-500/30"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
            >
              Search
            </button>
          </div>

          <div className="space-y-2">
            {searchResults.map((u) => (
              <div
                key={u.user_id}
                className="glass-card-static flex items-center justify-between p-4 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-200">{u.username}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <button
                  onClick={() => handleSendRequest(u.user_id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-md text-xs hover:bg-emerald-500/30 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

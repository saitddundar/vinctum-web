import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, UserPlus, UserMinus, Check, X, Users } from "lucide-react";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "friends";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [searchResults, setSearchResults] = useState<UserInfo[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadFriends(), loadRequests()]).finally(() => setLoading(false));
  }, []);

  // Sync tab from URL param (e.g. navigated from notification)
  useEffect(() => {
    const t = searchParams.get("tab") as Tab | null;
    if (t && ["friends", "requests", "search"].includes(t)) setTab(t);
  }, [searchParams]);

  function switchTab(t: Tab) {
    setTab(t);
    setSearchParams(t === "friends" ? {} : { tab: t });
  }

  async function loadFriends() {
    try { setFriends(await listFriends()); } catch { toast.error("Failed to load friends"); }
  }

  async function loadRequests() {
    try { setRequests(await listFriendRequests()); } catch { toast.error("Failed to load requests"); }
  }

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    try { setSearchResults(await searchUsers(query.trim())); }
    catch { toast.error("Search failed"); }
    finally { setLoading(false); }
  }

  async function handleSendRequest(userId: string) {
    try {
      await sendFriendRequest(userId);
      toast.success("Friend request sent");
      setSearchResults(prev => prev.filter(u => u.user_id !== userId));
    } catch (err: any) { toast.error(err?.response?.data?.error || "Failed to send request"); }
  }

  async function handleRespond(friendshipId: string, accept: boolean) {
    try {
      await respondToFriendRequest(friendshipId, accept);
      toast.success(accept ? "Friend request accepted" : "Friend request rejected");
      setRequests(prev => prev.filter(r => r.id !== friendshipId));
      if (accept) loadFriends();
      refreshNotifications();
    } catch { toast.error("Failed to respond"); }
  }

  async function handleRemove(friendshipId: string) {
    try {
      await removeFriend(friendshipId);
      toast.success("Friend removed");
      setFriends(prev => prev.filter(f => f.id !== friendshipId));
    } catch { toast.error("Failed to remove friend"); }
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "friends", label: "Friends", count: friends.length },
    { key: "requests", label: "Requests", count: requests.length },
    { key: "search", label: "Search" },
  ];

  if (loading && !friends.length && !requests.length) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>Friends</h1>
      {[1, 2, 3].map(i => <div key={i} className="glass-card-static animate-pulse" style={{ height: 56 }} />)}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>
          Your <span className="font-serif" style={{ color: "var(--accent)" }}>friends</span>
        </h1>
        <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 6, marginBottom: 0 }}>
          Add friends to send files directly to their public devices.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2" style={{ borderBottom: "1px solid var(--line)", paddingBottom: 14 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => switchTab(t.key)} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, border: "none", background: tab === t.key ? "oklch(0.78 0.15 160 / .1)" : "transparent", color: tab === t.key ? "var(--accent)" : "var(--muted)", cursor: "pointer", fontFamily: "Inter" }}>
            {t.label}
            {t.count !== undefined && t.count > 0 && <span style={{ fontSize: 10, color: "var(--muted-2)", marginLeft: 5 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Friends list */}
      {tab === "friends" && (
        friends.length === 0 ? (
          <div className="drop-zone" style={{ padding: 48, textAlign: "center" }}>
            <Users size={28} style={{ color: "var(--muted-2)", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>No friends yet</p>
            <button onClick={() => switchTab("search")} className="btn btn-primary" style={{ fontSize: 12 }}>
              <Search size={12} /> Find users
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {friends.map(f => (
              <div key={f.id} className="glass-card-static" style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 34, height: 34, borderRadius: 99, background: "oklch(0.78 0.15 160 / .12)", border: "1px solid oklch(0.78 0.15 160 / .25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--accent)", flexShrink: 0 }}>
                    {f.user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>{f.user.username}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{f.user.email}</div>
                  </div>
                </div>
                <button onClick={() => handleRemove(f.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-2)", padding: 4 }} title="Remove friend">
                  <UserMinus size={14} />
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Requests */}
      {tab === "requests" && (
        requests.length === 0 ? (
          <div className="drop-zone" style={{ padding: 48, textAlign: "center" }}>
            <Users size={28} style={{ color: "var(--muted-2)", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>No pending requests</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {requests.map(r => (
              <div key={r.id} className="glass-card-static" style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 34, height: 34, borderRadius: 99, background: "oklch(0.84 0.13 85 / .12)", border: "1px solid oklch(0.84 0.13 85 / .25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--amber)", flexShrink: 0 }}>
                    {r.user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>{r.user.username}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{r.user.email}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleRespond(r.id, true)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "oklch(0.78 0.15 160 / .1)", color: "var(--accent)", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                    <Check size={12} /> Accept
                  </button>
                  <button onClick={() => handleRespond(r.id, false)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "oklch(0.65 0.2 25 / .1)", color: "var(--red)", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                    <X size={12} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Search */}
      {tab === "search" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="flex gap-2">
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search by username…"
                className="vt-input"
                style={{ paddingLeft: 34, width: "100%" }}
                autoFocus
              />
            </div>
            <button onClick={handleSearch} disabled={loading} className="btn btn-primary" style={{ fontSize: 12, flexShrink: 0 }}>Search</button>
          </div>
          {searchResults.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {searchResults.map(u => (
                <div key={u.user_id} className="glass-card-static" style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div className="flex items-center gap-3">
                    <div style={{ width: 34, height: 34, borderRadius: 99, background: "oklch(1 0 0 / .06)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--fg-2)", flexShrink: 0 }}>
                      {u.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>{u.username}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{u.email}</div>
                    </div>
                  </div>
                  <button onClick={() => handleSendRequest(u.user_id)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "oklch(0.78 0.15 160 / .1)", color: "var(--accent)", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                    <UserPlus size={12} /> Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

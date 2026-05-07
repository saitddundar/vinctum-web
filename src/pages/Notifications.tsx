import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, UserPlus, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { listFriendRequests } from "../lib/friend-api";
import { useNotifications } from "../context/NotificationContext";
import type { Friend } from "../types/friend";

function timeAgo(iso: string) {
  if (!iso) return "";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now"; if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { counts } = useNotifications();
  const [requests, setRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setRequests(await listFriendRequests()); }
      catch { toast.error("Failed to load notifications"); }
      finally { setLoading(false); }
    })();
  }, []);

  const hasNotifications = requests.length > 0;

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>Notifications</h1>
      {[1, 2, 3].map(i => <div key={i} className="glass-card-static animate-pulse" style={{ height: 56 }} />)}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>
          Notifications
        </h1>
        <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 6, marginBottom: 0 }}>
          {counts.total > 0 ? `${counts.total} unread` : "You're all caught up."}
        </p>
      </div>

      {/* Friend requests */}
      {hasNotifications && (
        <div>
          <div style={{ fontSize: 10, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".09em", fontWeight: 600, marginBottom: 10 }}>Friend requests</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {requests.map(r => (
              <button
                key={r.id}
                onClick={() => navigate("/friends?tab=requests")}
                className="glass-card"
                style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", border: "1px solid oklch(0.84 0.13 85 / .2)", background: "oklch(0.84 0.13 85 / .03)", cursor: "pointer", borderRadius: 11 }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 99, background: "oklch(0.84 0.13 85 / .12)", border: "1px solid oklch(0.84 0.13 85 / .25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <UserPlus size={14} style={{ color: "var(--amber)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>
                    <span style={{ color: "var(--accent)" }}>{r.user.username}</span> sent you a friend request
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{timeAgo(r.created_at)}</div>
                </div>
                <ChevronRight size={14} style={{ color: "var(--muted-2)", flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasNotifications && (
        <div className="drop-zone" style={{ padding: 52, textAlign: "center" }}>
          <Bell size={28} style={{ color: "var(--muted-2)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>No notifications</p>
        </div>
      )}
    </div>
  );
}

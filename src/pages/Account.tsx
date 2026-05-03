import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../lib/auth-api";
import {
  listFriends,
  removeFriend,
  listFriendRequests,
  searchUsers,
  sendFriendRequest,
  respondToFriendRequest,
} from "../lib/friend-api";
import { useNotifications } from "../context/NotificationContext";
import {
  User,
  Shield,
  Bell,
  Palette,
  LogOut,
  Users,
  UserMinus,
  UserPlus,
  Search,
  Check,
  X,
  ArrowLeft,
  Copy,
} from "lucide-react";
import type { Friend, UserInfo } from "../types/friend";

type Tab = "profile" | "security" | "notifications" | "appearance" | "friends";

const NAV: { key: Tab; label: string; icon: typeof User }[] = [
  { key: "profile",       label: "Profile",       icon: User    },
  { key: "security",      label: "Security",       icon: Shield  },
  { key: "notifications", label: "Notifications",  icon: Bell    },
  { key: "appearance",    label: "Appearance",     icon: Palette },
  { key: "friends",       label: "Friends",        icon: Users   },
];

/* ─── Shared styles ───────────────────────────────────────────────── */
const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "20px 0",
  borderBottom: "1px solid var(--line)",
};
const label: React.CSSProperties = {
  fontSize: 13.5, fontWeight: 500, color: "var(--fg)", marginBottom: 4,
};
const sub: React.CSSProperties = {
  fontSize: 12, color: "var(--muted)", lineHeight: 1.5,
};

/* ─── Root ────────────────────────────────────────────────────────── */
export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");

  function handleLogout() {
    logout();
    toast.success("Signed out");
    navigate("/");
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* ── Top bar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        borderBottom: "1px solid var(--line)",
        background: "oklch(0.14 0.012 235 / .85)", backdropFilter: "blur(12px)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 32px",
          height: 54, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span className="logo-mark" />
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--fg)" }}>
              vinctum
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link to="/dashboard" className="btn btn-ghost" style={{ fontSize: 12.5, padding: "5px 12px", gap: 5 }}>
              <ArrowLeft size={13} /> Dashboard
            </Link>
            <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Account settings</span>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{
        flex: 1, maxWidth: 1100, margin: "0 auto", padding: "48px 32px 80px",
        display: "grid", gridTemplateColumns: "220px 1fr", gap: 40, width: "100%",
      }}>
        {/* ── Sidebar ── */}
        <aside style={{ display: "flex", flexDirection: "column" }}>
          {/* Avatar block */}
          <div style={{ marginBottom: 28, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "linear-gradient(135deg, oklch(0.25 0.02 235), oklch(0.2 0.02 235))",
              border: "1px solid var(--line)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.02em",
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg)" }}>{user?.username}</div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>Personal · free</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map(n => (
              <button
                key={n.key}
                id={`account-nav-${n.key}`}
                onClick={() => setTab(n.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 9,
                  background: tab === n.key ? "oklch(0.78 0.15 160 / .07)" : "transparent",
                  border: tab === n.key ? "1px solid oklch(0.78 0.15 160 / .18)" : "1px solid transparent",
                  color: tab === n.key ? "var(--accent)" : "var(--fg-2)",
                  fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left",
                  transition: "all .15s",
                  borderLeft: tab === n.key ? "2px solid var(--accent)" : "2px solid transparent",
                }}
              >
                <n.icon size={14} strokeWidth={1.7} />
                {n.label}
              </button>
            ))}
          </nav>

          {/* Divider + Sign out */}
          <div style={{ marginTop: "auto", paddingTop: 24, borderTop: "1px solid var(--line)" }}>
            <button
              id="account-sign-out"
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 9,
                background: "transparent", border: "1px solid transparent",
                color: "var(--fg-2)", fontSize: 13, fontWeight: 500,
                cursor: "pointer", width: "100%", transition: "color .15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--fg-2)")}
            >
              <LogOut size={14} strokeWidth={1.7} />
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Content panel ── */}
        <main style={{ minWidth: 0 }}>
          {tab === "profile"       && <ProfileTab       user={user} />}
          {tab === "security"      && <SecurityTab      />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "appearance"    && <AppearanceTab    />}
          {tab === "friends"       && <FriendsTab       />}
        </main>
      </div>
    </div>
  );
}

/* ─── Section shell ───────────────────────────────────────────────── */
function Section({
  title, description, children,
}: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ marginBottom: 28, paddingBottom: 18, borderBottom: "1px solid var(--line)" }}>
        <h1 style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em", margin: "0 0 4px" }}>{title}</h1>
        <p style={{ fontSize: 12.5, color: "var(--accent)", margin: 0 }}>{description}</p>
      </div>
      {children}
    </div>
  );
}

/* ─── Profile ─────────────────────────────────────────────────────── */
function ProfileTab({ user }: { user: any }) {
  const [displayName, setDisplayName] = useState(user?.username || "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleSave() {
    if (!displayName.trim() || displayName === user?.username) return;
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success("Display name updated"); }, 500);
  }

  function copyId() {
    navigator.clipboard.writeText(user?.user_id ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Section title="Profile" description="Your identity on the Vinctum mesh.">
      {/* Display name */}
      <div style={row}>
        <div style={{ flex: 1 }}>
          <div style={label}>Display name</div>
          <div style={sub}>How you appear to other mesh participants.</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginLeft: 32 }}>
          <input
            id="profile-display-name"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="vt-input"
            style={{ width: 200 }}
          />
          <button
            id="profile-save-btn"
            onClick={handleSave}
            disabled={saving || !displayName.trim() || displayName === user?.username}
            className="btn btn-primary"
            style={{ fontSize: 12.5 }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Email */}
      <div style={row}>
        <div style={{ flex: 1 }}>
          <div style={label}>Email</div>
          <div style={sub}>Used for account recovery. Never shared.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "var(--fg-2)" }}>{user?.email ?? "—"}</span>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: ".06em",
            padding: "2px 8px", borderRadius: 99,
            background: "oklch(0.78 0.15 160 / .12)", border: "1px solid oklch(0.78 0.15 160 / .25)",
            color: "var(--accent)", textTransform: "uppercase",
          }}>VERIFIED</span>
        </div>
      </div>

      {/* User ID */}
      <div style={row}>
        <div style={{ flex: 1 }}>
          <div style={label}>User ID</div>
          <div style={sub}>Your immutable identifier on the mesh.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <code style={{
            fontSize: 12, fontFamily: "var(--font-mono, monospace)",
            background: "oklch(0.17 0.01 235)", border: "1px solid var(--line)",
            borderRadius: 8, padding: "5px 10px", color: "var(--fg-2)",
          }}>
            {user?.user_id ? `${user.user_id.slice(0, 16)}…` : "—"}
          </code>
          <button
            id="profile-copy-id"
            onClick={copyId}
            style={{
              padding: 6, borderRadius: 7, border: "1px solid var(--line)",
              background: "transparent", cursor: "pointer", color: "var(--muted)",
              display: "flex", alignItems: "center",
            }}
            title="Copy user ID"
          >
            {copied ? <Check size={13} strokeWidth={2} color="var(--accent)" /> : <Copy size={13} strokeWidth={1.7} />}
          </button>
        </div>
      </div>

      {/* Member since */}
      <div style={{ ...row, borderBottom: "none" }}>
        <div style={{ flex: 1 }}>
          <div style={label}>Member since</div>
          <div style={sub}>When your root identity was created.</div>
        </div>
        <span style={{ fontSize: 13, color: "var(--fg-2)" }}>
          {user?.created_at
            ? new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
            : "—"}
        </span>
      </div>
    </Section>
  );
}

/* ─── Security ────────────────────────────────────────────────────── */
function SecurityTab() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault(); setPwError("");
    if (newPw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      toast.success("Password updated");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      setPwError(err?.response?.data?.error || "Failed to change password");
    } finally { setPwLoading(false); }
  }

  return (
    <Section title="Security" description="Keys, sessions, and authentication.">
      {/* Change password */}
      <div style={{ ...row, flexDirection: "column", alignItems: "stretch", gap: 18 }}>
        <div style={label}>Change password</div>
        <div style={sub}>Used to decrypt your local key store on this device.</div>

        {pwError && (
          <div style={{
            padding: "10px 14px", borderRadius: 10,
            background: "oklch(0.72 0.17 25 / .08)", border: "1px solid oklch(0.72 0.17 25 / .2)",
            fontSize: 12.5, color: "var(--red)",
          }}>{pwError}</div>
        )}

        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ ...sub, display: "block", marginBottom: 6 }}>Current password</label>
            <input id="sec-cur-pw" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required className="vt-input" style={{ width: "100%", maxWidth: 320 }} />
          </div>
          <div>
            <label style={{ ...sub, display: "block", marginBottom: 6 }}>New password</label>
            <input id="sec-new-pw" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required className="vt-input" placeholder="At least 8 characters" style={{ width: "100%", maxWidth: 320 }} />
          </div>
          <div>
            <label style={{ ...sub, display: "block", marginBottom: 6 }}>Confirm new password</label>
            <input id="sec-confirm-pw" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required className="vt-input" style={{ width: "100%", maxWidth: 320 }} />
          </div>
          <div>
            <button id="sec-update-pw-btn" type="submit" disabled={pwLoading} className="btn btn-primary" style={{ fontSize: 12.5 }}>
              {pwLoading ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </Section>
  );
}

/* ─── Notifications ───────────────────────────────────────────────── */
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    transfers: true,
    pairing: true,
    sessions: false,
    security: true,
    relay: false,
  });

  const items: { key: keyof typeof prefs; label: string; desc: string }[] = [
    { key: "transfers", label: "Transfer completed / failed", desc: "When a file transfer finishes or encounters an error." },
    { key: "pairing",   label: "Pairing requests",            desc: "When a new device attempts to join your mesh." },
    { key: "sessions",  label: "Session activity",            desc: "When devices join or leave one of your sessions." },
    { key: "security",  label: "Security events",             desc: "Key rotations, anomaly detections, failed auth attempts." },
    { key: "relay",     label: "Relay fallback",              desc: "When a transfer uses a relay instead of a direct path." },
  ];

  function Toggle({ on, toggle }: { on: boolean; toggle: () => void }) {
    return (
      <button onClick={toggle} style={{
        width: 42, height: 24, borderRadius: 99, flexShrink: 0,
        background: on ? "oklch(0.78 0.15 160 / .22)" : "var(--panel)",
        border: `1px solid ${on ? "oklch(0.78 0.15 160 / .4)" : "var(--line-2)"}`,
        position: "relative", cursor: "pointer", transition: "all .18s",
      }}>
        <span style={{
          position: "absolute", top: 3, left: on ? 20 : 3,
          width: 16, height: 16, borderRadius: 99,
          background: on ? "var(--accent)" : "var(--muted)",
          transition: "left .18s",
        }} />
      </button>
    );
  }

  return (
    <Section title="Notifications" description="Choose what you want to be notified about.">
      {items.map((item, i) => (
        <div key={item.key} style={{ ...row, ...(i === items.length - 1 ? { borderBottom: "none" } : {}) }}>
          <div style={{ flex: 1 }}>
            <div style={label}>{item.label}</div>
            <div style={sub}>{item.desc}</div>
          </div>
          <Toggle on={prefs[item.key]} toggle={() => setPrefs(p => ({ ...p, [item.key]: !p[item.key] }))} />
        </div>
      ))}
    </Section>
  );
}

/* ─── Appearance ──────────────────────────────────────────────────── */
function AppearanceTab() {
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [density, setDensity] = useState<"compact" | "default" | "comfortable">("default");

  function SegmentGroup<T extends string>({
    value, options, onChange,
  }: { value: T; options: T[]; onChange: (v: T) => void }) {
    return (
      <div style={{ display: "flex", gap: 4 }}>
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: "7px 18px", borderRadius: 9, fontSize: 13, fontWeight: 500,
              cursor: "pointer", transition: "all .15s",
              border: value === opt ? "1px solid oklch(0.78 0.15 160 / .35)" : "1px solid var(--line)",
              background: value === opt ? "oklch(0.78 0.15 160 / .1)" : "transparent",
              color: value === opt ? "var(--accent)" : "var(--fg-2)",
            }}
          >
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <Section title="Appearance" description="Display preferences.">
      {/* Theme */}
      <div style={row}>
        <div style={{ flex: 1 }}>
          <div style={label}>Theme</div>
          <div style={sub}>Interface colour scheme.</div>
          {theme !== "dark" && (
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6 }}>
              Light and system themes coming soon.
            </div>
          )}
        </div>
        <SegmentGroup value={theme} options={["dark", "light", "system"]} onChange={setTheme} />
      </div>

      {/* Density */}
      <div style={{ ...row, borderBottom: "none" }}>
        <div style={{ flex: 1 }}>
          <div style={label}>Density</div>
          <div style={sub}>Information density in lists and tables.</div>
        </div>
        <SegmentGroup value={density} options={["compact", "default", "comfortable"]} onChange={setDensity} />
      </div>
    </Section>
  );
}

/* ─── Friends ─────────────────────────────────────────────────────── */
type FriendSubTab = "list" | "requests" | "search";

function FriendsTab() {
  const { refresh: refreshNotifications } = useNotifications();
  const [subTab, setSubTab]               = useState<FriendSubTab>("list");
  const [friends, setFriends]             = useState<Friend[]>([]);
  const [requests, setRequests]           = useState<Friend[]>([]);
  const [searchResults, setSearchResults] = useState<UserInfo[]>([]);
  const [query, setQuery]                 = useState("");
  const [searching, setSearching]         = useState(false);
  const [initLoading, setInitLoading]     = useState(true);
  const inputRef                          = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([loadFriends(), loadRequests()]).finally(() => setInitLoading(false));
  }, []);

  async function loadFriends() {
    try { setFriends(await listFriends()); }
    catch { toast.error("Failed to load friends"); }
  }

  async function loadRequests() {
    try { setRequests(await listFriendRequests()); }
    catch { toast.error("Failed to load requests"); }
  }

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    try { setSearchResults(await searchUsers(query.trim())); }
    catch { toast.error("Search failed"); }
    finally { setSearching(false); }
  }

  async function handleSendRequest(userId: string) {
    try {
      await sendFriendRequest(userId);
      toast.success("Friend request sent");
      setSearchResults(prev => prev.filter(u => u.user_id !== userId));
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to send request");
    }
  }

  async function handleRespond(friendshipId: string, accept: boolean) {
    try {
      await respondToFriendRequest(friendshipId, accept);
      toast.success(accept ? "Request accepted" : "Request rejected");
      setRequests(prev => prev.filter(r => r.id !== friendshipId));
      if (accept) loadFriends();
      refreshNotifications();
    } catch { toast.error("Failed to respond"); }
  }

  async function handleRemove(id: string) {
    try {
      await removeFriend(id);
      setFriends(prev => prev.filter(f => f.id !== id));
      toast.success("Friend removed");
    } catch { toast.error("Failed to remove friend"); }
  }

  /* Shared user row card */
  function UserCard({ avatar, name, email, actions }: {
    avatar: string; name: string; email: string; actions: React.ReactNode;
  }) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px",
        background: "oklch(0.17 0.012 235 / .4)",
        border: "1px solid var(--line)", borderRadius: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 99, flexShrink: 0,
            background: "oklch(0.78 0.15 160 / .1)",
            border: "1px solid oklch(0.78 0.15 160 / .2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, color: "var(--accent)",
          }}>{avatar}</div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--fg)" }}>{name}</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{email}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>{actions}</div>
      </div>
    );
  }

  const subTabs: { key: FriendSubTab; label: string; count?: number }[] = [
    { key: "list",     label: "Friends",  count: friends.length  },
    { key: "requests", label: "Requests", count: requests.length },
    { key: "search",   label: "Search"   },
  ];

  return (
    <Section title="Friends" description="Manage your connections on the Vinctum mesh.">

      {/* ── Sub-tab bar ── */}
      <div style={{
        display: "flex", gap: 4, padding: 5,
        background: "oklch(0.17 0.01 235 / .6)",
        border: "1px solid var(--line)", borderRadius: 12,
        width: "fit-content", marginBottom: 24,
      }}>
        {subTabs.map(t => (
          <button
            key={t.key}
            id={`friends-subtab-${t.key}`}
            onClick={() => setSubTab(t.key)}
            style={{
              padding: "7px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              cursor: "pointer", transition: "all .15s",
              border: subTab === t.key ? "1px solid oklch(0.78 0.15 160 / .25)" : "1px solid transparent",
              background: subTab === t.key ? "oklch(0.78 0.15 160 / .1)" : "transparent",
              color: subTab === t.key ? "var(--accent)" : "var(--fg-2)",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span style={{
                fontSize: 11, padding: "1px 7px", borderRadius: 99,
                background: subTab === t.key ? "oklch(0.78 0.15 160 / .2)" : "var(--panel)",
                color: subTab === t.key ? "var(--accent)" : "var(--muted)",
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Friends list ── */}
      {subTab === "list" && (
        initLoading ? (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Loading…</span>
          </div>
        ) : friends.length === 0 ? (
          <div style={{
            padding: "52px 24px", textAlign: "center",
            border: "1px dashed var(--line-2)", borderRadius: 14,
          }}>
            <Users size={28} style={{ color: "var(--muted-2)", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, color: "var(--fg-2)", margin: "0 0 8px" }}>No friends yet</p>
            <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>
              Use the{" "}
              <button
                onClick={() => setSubTab("search")}
                style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 12.5, padding: 0 }}
              >Search</button>
              {" "}tab to find and add people.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {friends.map(f => (
              <UserCard
                key={f.id}
                avatar={f.user.username.slice(0, 2).toUpperCase()}
                name={f.user.username}
                email={f.user.email}
                actions={
                  <button
                    onClick={() => handleRemove(f.id)}
                    style={{
                      padding: "6px 12px", borderRadius: 8, fontSize: 11.5,
                      background: "oklch(0.72 0.17 25 / .08)",
                      border: "1px solid oklch(0.72 0.17 25 / .15)",
                      color: "var(--red)", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 5,
                    }}
                  >
                    <UserMinus size={13} /> Remove
                  </button>
                }
              />
            ))}
          </div>
        )
      )}

      {/* ── Requests ── */}
      {subTab === "requests" && (
        requests.length === 0 ? (
          <div style={{
            padding: "52px 24px", textAlign: "center",
            border: "1px dashed var(--line-2)", borderRadius: 14,
          }}>
            <Check size={26} style={{ color: "var(--muted-2)", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, color: "var(--fg-2)", margin: 0 }}>No pending requests</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {requests.map(r => (
              <UserCard
                key={r.id}
                avatar={r.user.username.slice(0, 2).toUpperCase()}
                name={r.user.username}
                email={r.user.email}
                actions={<>
                  <button
                    onClick={() => handleRespond(r.id, true)}
                    title="Accept"
                    style={{
                      padding: "6px 12px", borderRadius: 8, fontSize: 11.5,
                      background: "oklch(0.78 0.15 160 / .1)",
                      border: "1px solid oklch(0.78 0.15 160 / .2)",
                      color: "var(--accent)", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 5,
                    }}
                  >
                    <Check size={13} /> Accept
                  </button>
                  <button
                    onClick={() => handleRespond(r.id, false)}
                    title="Reject"
                    style={{
                      padding: "6px 12px", borderRadius: 8, fontSize: 11.5,
                      background: "oklch(0.72 0.17 25 / .08)",
                      border: "1px solid oklch(0.72 0.17 25 / .15)",
                      color: "var(--red)", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 5,
                    }}
                  >
                    <X size={13} /> Reject
                  </button>
                </>}
              />
            ))}
          </div>
        )
      )}

      {/* ── Search ── */}
      {subTab === "search" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={14} style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                color: "var(--muted)", pointerEvents: "none",
              }} />
              <input
                id="friends-search-input"
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search by username…"
                className="vt-input"
                style={{ paddingLeft: 36, width: "100%" }}
                autoFocus
              />
            </div>
            <button
              id="friends-search-btn"
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="btn btn-primary"
              style={{ fontSize: 12.5 }}
            >
              {searching ? "Searching…" : "Search"}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {searchResults.map(u => (
                <UserCard
                  key={u.user_id}
                  avatar={u.username.slice(0, 2).toUpperCase()}
                  name={u.username}
                  email={u.email}
                  actions={
                    <button
                      onClick={() => handleSendRequest(u.user_id)}
                      style={{
                        padding: "6px 12px", borderRadius: 8, fontSize: 11.5,
                        background: "oklch(0.78 0.15 160 / .1)",
                        border: "1px solid oklch(0.78 0.15 160 / .2)",
                        color: "var(--accent)", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 5,
                      }}
                    >
                      <UserPlus size={13} /> Add
                    </button>
                  }
                />
              ))}
            </div>
          )}

          {searchResults.length === 0 && query && !searching && (
            <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", paddingTop: 24 }}>
              No users found for "{query}".
            </p>
          )}
        </div>
      )}
    </Section>
  );
}

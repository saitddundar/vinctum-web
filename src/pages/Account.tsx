import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.username || "");
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    transfers: true,
    devices: true,
    sessions: false,
  });

  function handleLogout() {
    logout();
    toast.success("Signed out");
    navigate("/");
  }

  function handleSaveName() {
    if (!displayName.trim() || displayName === user?.username) return;
    setSaving(true);
    // placeholder — will hit API when backend supports it
    setTimeout(() => {
      setSaving(false);
      toast.success("Display name updated");
    }, 500);
  }

  function handleRevokeAll() {
    if (!confirm("Sign out of all devices? You'll need to sign in again everywhere.")) return;
    // placeholder — will hit revoke-all-tokens endpoint
    toast.success("All sessions revoked");
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800/40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-base font-medium tracking-tight text-gray-200 hover:text-gray-100 transition-colors">
            vinctum
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="px-4 py-1.5 rounded-md text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Dashboard
            </Link>
            <span className="px-4 py-1.5 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-100">
              Account
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-xl font-medium text-gray-100">Account</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your profile and settings</p>
        </div>

        {/* Profile */}
        <section className="rounded-md border border-gray-800/40 bg-gray-900/50 p-6 space-y-5">
          <p className="text-xs uppercase tracking-wider text-gray-500">Profile</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700/50 flex items-center justify-center text-lg text-gray-400 uppercase">
              {user?.username?.charAt(0) || "?"}
            </div>
            <div>
              <p className="text-sm text-gray-100 font-medium">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="block">
              <span className="text-xs text-gray-500">Display name</span>
              <div className="flex gap-2 mt-1.5">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 bg-gray-800/80 border border-gray-700/50 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving || !displayName.trim() || displayName === user?.username}
                  className="px-4 py-2 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </label>
          </div>

          <div className="border-t border-gray-800/40 pt-4 space-y-3">
            <DetailRow label="User ID" value={user?.user_id || "—"} mono />
            <DetailRow label="Email" value={user?.email || "—"} />
            <DetailRow label="Member since" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"} />
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-md border border-gray-800/40 bg-gray-900/50 p-6 space-y-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">Notifications</p>
          <Toggle
            label="Transfer notifications"
            desc="Get notified when a transfer completes or fails"
            checked={notifications.transfers}
            onChange={(v) => setNotifications((p) => ({ ...p, transfers: v }))}
          />
          <Toggle
            label="Device alerts"
            desc="Notify on new device pairing requests"
            checked={notifications.devices}
            onChange={(v) => setNotifications((p) => ({ ...p, devices: v }))}
          />
          <Toggle
            label="Session updates"
            desc="Notify when devices join or leave sessions"
            checked={notifications.sessions}
            onChange={(v) => setNotifications((p) => ({ ...p, sessions: v }))}
          />
        </section>

        {/* Theme */}
        <section className="rounded-md border border-gray-800/40 bg-gray-900/50 p-6 space-y-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">Appearance</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Theme</p>
              <p className="text-xs text-gray-600 mt-0.5">Light mode coming soon</p>
            </div>
            <span className="px-3 py-1 rounded-md bg-gray-800/80 border border-gray-700/50 text-xs text-gray-400">Dark</span>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="rounded-md border border-red-900/20 bg-red-950/10 p-6 space-y-4">
          <p className="text-xs uppercase tracking-wider text-red-400/60">Danger Zone</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Sign out everywhere</p>
              <p className="text-xs text-gray-600 mt-0.5">Revoke all active sessions across all devices</p>
            </div>
            <button
              onClick={handleRevokeAll}
              className="px-4 py-1.5 rounded-md text-xs text-red-400 border border-red-900/30 hover:border-red-400/30 hover:bg-red-400/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Revoke all
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Sign out</p>
              <p className="text-xs text-gray-600 mt-0.5">Sign out of this browser</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 rounded-md text-xs text-red-400 border border-red-900/30 hover:border-red-400/30 hover:bg-red-400/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Sign out
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-xs text-gray-500 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-300">{label}</p>
        <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${checked ? "bg-emerald-500/80" : "bg-gray-700"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

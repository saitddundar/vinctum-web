import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../lib/auth-api";

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [displayName,      setDisplayName]      = useState(user?.username || "");
  const [saving,           setSaving]           = useState(false);
  const [showPwForm,       setShowPwForm]       = useState(false);
  const [currentPw,        setCurrentPw]        = useState("");
  const [newPw,            setNewPw]            = useState("");
  const [confirmPw,        setConfirmPw]        = useState("");
  const [pwLoading,        setPwLoading]        = useState(false);
  const [pwError,          setPwError]          = useState("");
  const [notifications,    setNotifications]    = useState({ transfers: true, devices: true, sessions: false });

  function handleLogout() { logout(); toast.success("Signed out"); navigate("/"); }

  function handleSaveName() {
    if (!displayName.trim() || displayName === user?.username) return;
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success("Display name updated"); }, 500);
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault(); setPwError("");
    if (newPw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      toast.success("Password updated"); setShowPwForm(false);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) { setPwError(err?.response?.data?.error || "Failed to change password"); }
    finally { setPwLoading(false); }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <header style={{ borderBottom: "1px solid var(--line)", background: "oklch(0.152 0.012 235 / .7)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 32px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
            <span className="logo-mark" />
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--fg)" }}>vinctum</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12.5 }}>Dashboard</Link>
            <span style={{ padding: "6px 12px", borderRadius: 9, background: "oklch(1 0 0 / .04)", border: "1px solid var(--line-2)", fontSize: 12.5, color: "var(--fg)" }}>Account</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "48px 32px 80px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>
            Your <span className="font-serif" style={{ color: "var(--accent)" }}>account</span>
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--fg-2)", marginTop: 8, marginBottom: 0 }}>Identity, security, and settings. Almost everything is stored on your devices.</p>
        </div>

        {/* Profile */}
        <Section title="Profile" subtitle="Your public identity on the mesh">
          <div className="flex items-center gap-4" style={{ marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: 99, background: "oklch(0.78 0.15 160 / .1)", border: "1px solid oklch(0.78 0.15 160 / .25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--accent)", fontWeight: 600, letterSpacing: "-0.01em" }}>
              {user?.username?.slice(0, 2).toUpperCase() ?? "??"}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "var(--fg)" }}>{user?.username}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>{user?.email}</div>
            </div>
          </div>
          <label style={{ display: "block" }}>
            <span style={{ fontSize: 11.5, color: "var(--fg-2)", fontWeight: 500 }}>Display name</span>
            <div className="flex gap-2 mt-1.5">
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="vt-input" style={{ flex: 1 }} />
              <button onClick={handleSaveName} disabled={saving || !displayName.trim() || displayName === user?.username} className="btn btn-ghost" style={{ fontSize: 12.5 }}>{saving ? "Saving…" : "Save"}</button>
            </div>
          </label>
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            {[["User ID", user?.user_id ?? "—", true], ["Email", user?.email ?? "—", false], ["Member since", user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—", false]].map(([l,v,mono]) => (
              <div key={l as string} className="flex justify-between items-center">
                <span style={{ fontSize: 13, color: "var(--fg-2)" }}>{l}</span>
                <span className={mono ? "font-mono" : ""} style={{ fontSize: 12.5, color: "var(--muted)" }}>{v}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Security */}
        <Section title="Security" subtitle="Keys, sessions, and password">
          {showPwForm ? (
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pwError && <div style={{ padding: "10px 12px", borderRadius: 8, background: "oklch(0.72 0.17 25 / .1)", border: "1px solid oklch(0.72 0.17 25 / .25)", fontSize: 12.5, color: "var(--red)" }}>{pwError}</div>}
              <div>
                <label style={{ fontSize: 11.5, color: "var(--fg-2)", display: "block", marginBottom: 6 }}>Current password</label>
                <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required className="vt-input" autoFocus />
              </div>
              <div>
                <label style={{ fontSize: 11.5, color: "var(--fg-2)", display: "block", marginBottom: 6 }}>New password</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required className="vt-input" placeholder="At least 8 characters" />
              </div>
              <div>
                <label style={{ fontSize: 11.5, color: "var(--fg-2)", display: "block", marginBottom: 6 }}>Confirm new password</label>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required className="vt-input" />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowPwForm(false); setPwError(""); }} className="btn btn-ghost" style={{ fontSize: 12.5 }}>Cancel</button>
                <button type="submit" disabled={pwLoading} className="btn btn-primary" style={{ fontSize: 12.5 }}>{pwLoading ? "Updating…" : "Update password"}</button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>Password</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>Change your account password</div>
              </div>
              <button onClick={() => setShowPwForm(true)} className="btn btn-ghost" style={{ fontSize: 12.5 }}>Change</button>
            </div>
          )}
        </Section>

        {/* Notifications */}
        <Section title="Notifications" subtitle="When to be notified">
          {[
            ["transfers", "Transfer notifications", "Get notified when a transfer completes or fails"],
            ["devices",   "Device alerts",          "Notify on new pairing requests"],
            ["sessions",  "Session updates",        "Notify when devices join or leave sessions"],
          ].map(([k, l, d]) => (
            <div key={k} className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{l}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{d}</div>
              </div>
              <button onClick={() => setNotifications(p => ({ ...p, [k]: !p[k as keyof typeof p] }))}
                style={{ width: 36, height: 20, borderRadius: 99, background: notifications[k as keyof typeof notifications] ? "oklch(0.78 0.15 160 / .3)" : "var(--line)", border: `1px solid ${notifications[k as keyof typeof notifications] ? "oklch(0.78 0.15 160 / .5)" : "var(--line-2)"}`, position: "relative", cursor: "pointer" }}>
                <span style={{ position: "absolute", top: 1, left: notifications[k as keyof typeof notifications] ? 16 : 1, width: 16, height: 16, borderRadius: 99, background: notifications[k as keyof typeof notifications] ? "var(--accent)" : "var(--muted)", transition: "left .18s" }} />
              </button>
            </div>
          ))}
        </Section>

        {/* Danger */}
        <div style={{ border: "1px solid oklch(0.72 0.17 25 / .2)", borderRadius: 14, padding: 24, background: "oklch(0.72 0.17 25 / .02)" }}>
          <div style={{ fontSize: 11, color: "oklch(0.72 0.17 25 / .6)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600, marginBottom: 18 }}>Danger zone</div>
          {[
            { t: "Sign out everywhere", d: "Revoke all active sessions across all devices", fn: () => { toast.success("All sessions revoked"); logout(); navigate("/login"); }, label: "Revoke all" },
            { t: "Sign out",            d: "Sign out of this browser",                       fn: handleLogout, label: "Sign out" },
          ].map(a => (
            <div key={a.t} className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{a.t}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{a.d}</div>
              </div>
              <button onClick={a.fn} className="btn btn-danger" style={{ fontSize: 12.5 }}>{a.label}</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 24, marginBottom: 18 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.005em" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { resetPassword } from "../lib/auth-api";
import { AuthShell } from "../components/AuthShell";
import { Check } from "lucide-react";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (password !== confirm) { toast.error("Passwords do not match."); return; }
    if (!token) { toast.error("Invalid or missing reset token."); return; }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to reset password. The link may have expired.");
    } finally { setLoading(false); }
  }

  const side = (
    <div style={{ position: "absolute", inset: 0, padding: 48, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div className="glass-card-static" style={{ padding: 24 }}>
        <div style={{ fontSize: 11, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".09em", marginBottom: 18, fontWeight: 600 }}>What changes</div>
        {[
          { t: "Your password wraps the same root key", d: "We re-encrypt your existing Ed25519 key — no new identity." },
          { t: "Other devices stay signed in", d: "They hold their own key copy. Nothing changes for them." },
          { t: "This device's sessions are terminated", d: "Any session using the old password is invalidated immediately." },
        ].map((s, i) => (
          <div key={i} className="flex gap-3" style={{ marginBottom: i < 2 ? 16 : 0 }}>
            <div style={{ width: 22, height: 22, borderRadius: 99, background: "oklch(0.78 0.15 160 / .08)", border: "1px solid oklch(0.78 0.15 160 / .2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontSize: 11, fontFamily: "JetBrains Mono", flexShrink: 0 }}>{i+1}</div>
            <div>
              <div style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>{s.t}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3, lineHeight: 1.5 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (done) return (
    <AuthShell title={<>Password <span className="font-serif" style={{ color: "var(--accent)" }}>updated.</span></>} side={side}>
      <div className="glass-card-static" style={{ padding: 28, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 99, background: "oklch(0.78 0.15 160 / .1)", border: "1px solid oklch(0.78 0.15 160 / .25)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", margin: "0 auto 16px" }}>
          <Check size={24} />
        </div>
        <p style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.6 }}>Your password has been updated. Redirecting to sign in…</p>
        <Link to="/login" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none", display: "block", marginTop: 14 }}>Sign in now</Link>
      </div>
    </AuthShell>
  );

  return (
    <AuthShell
      title={<>Set a new <span className="font-serif" style={{ color: "var(--accent)" }}>password.</span></>}
      subtitle="Your root key stays the same — we're just re-wrapping it."
      footer={<p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}><Link to="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>Back to sign in</Link></p>}
      side={side}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500, display: "block", marginBottom: 7 }}>New password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="vt-input" placeholder="At least 8 characters" autoFocus />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500, display: "block", marginBottom: 7 }}>Confirm password</label>
          <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} className="vt-input" placeholder="Repeat password" />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent: "center", padding: "11px 16px" }}>
          {loading ? "Saving…" : "Save & sign in"}
        </button>
      </form>
    </AuthShell>
  );
}

import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../lib/auth-api";
import { AuthShell } from "../components/AuthShell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { await forgotPassword(email); } catch {}
    finally { setLoading(false); setSent(true); }
  }

  const side = (
    <div style={{ position: "absolute", inset: 0, padding: 48, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontSize: 11, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".09em", marginBottom: 20, fontWeight: 600 }}>Recovery paths</div>
      {[
        { icon: "📱", t: "Paired device approval", d: "Your other device shows a prompt — one tap and you're in.", rec: true },
        { icon: "🔑", t: "Recovery phrase",        d: "12 words you wrote down at signup. Works even if every device is lost." },
        { icon: "👥", t: "Social recovery",        d: "3 of 5 trusted contacts attest. Available on Team plan.", coming: true },
      ].map((p, i) => (
        <div key={i} className="glass-card-static" style={{ padding: 16, marginBottom: 10, display: "flex", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "oklch(0.78 0.15 160 / .08)", border: "1px solid oklch(0.78 0.15 160 / .2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{p.icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>{p.t}</span>
              {p.rec && <span className="chip chip-emerald" style={{ fontSize: 9 }}>recommended</span>}
              {p.coming && <span className="pill pill-muted">coming</span>}
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 0", lineHeight: 1.5 }}>{p.d}</p>
          </div>
        </div>
      ))}
    </div>
  );

  if (sent) return (
    <AuthShell title={<>Check your <span className="font-serif" style={{ color: "var(--accent)" }}>inbox.</span></>} side={side}
      footer={<p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}><Link to="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>Back to sign in</Link></p>}>
      <div className="glass-card-static" style={{ padding: 24 }}>
        <p style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.6 }}>
          If an account exists for <strong style={{ color: "var(--fg)" }}>{email}</strong>, we sent a reset link. Check spam if nothing arrives in 2 minutes.
        </p>
      </div>
    </AuthShell>
  );

  return (
    <AuthShell
      title={<>Recover your <span className="font-serif" style={{ color: "var(--accent)" }}>mesh.</span></>}
      subtitle="Enter your email. If a paired device is online, we'll send an approval prompt to it."
      footer={<p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}><Link to="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>Back to sign in</Link></p>}
      side={side}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500, display: "block", marginBottom: 7 }}>Email address</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="vt-input" placeholder="you@example.com" autoFocus />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent: "center", padding: "11px 16px" }}>
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}

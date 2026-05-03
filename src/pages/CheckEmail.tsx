import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resendVerification } from "../lib/auth-api";
import { AuthShell } from "../components/AuthShell";
import { Mail } from "lucide-react";

export default function CheckEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    if (!email) return;
    setLoading(true);
    try { await resendVerification(email); } catch {}
    finally { setLoading(false); setResent(true); }
  }

  return (
    <AuthShell
      title={<>Check your <span className="font-serif" style={{ color: "var(--accent)" }}>inbox.</span></>}
      subtitle="We sent a verification link to confirm this email is yours."
      footer={<p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}><Link to="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>Back to sign in</Link></p>}
      side={
        <div style={{ position: "absolute", inset: 0, padding: 48, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 22, lineHeight: 1.35, letterSpacing: "-0.015em", color: "var(--fg)", maxWidth: 420, marginBottom: 32 }}>
            <span className="font-serif" style={{ color: "var(--accent)" }}>"</span>Email is a temporary side-channel — just enough to prove you can receive mail at that address. Nothing more.<span className="font-serif" style={{ color: "var(--accent)" }}>"</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>— Principle 3 of the Vinctum manifesto</div>
        </div>
      }
    >
      <div className="glass-card-static" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 16, background: "oklch(0.78 0.15 160 / .04)", borderColor: "oklch(0.78 0.15 160 / .2)" }}>
        <div style={{ width: 52, height: 52, borderRadius: 13, background: "oklch(0.78 0.15 160 / .1)", border: "1px solid oklch(0.78 0.15 160 / .3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", marginBottom: 14 }}>
          <Mail size={22} />
        </div>
        <div style={{ fontSize: 14, color: "var(--fg)", fontWeight: 500 }}>Email on its way to</div>
        <div className="font-mono" style={{ fontSize: 14, color: "var(--accent)", marginTop: 4 }}>{email || "your inbox"}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 10, lineHeight: 1.5 }}>Usually arrives within 30 seconds. Check spam if nothing shows up in 2 minutes.</div>
      </div>
      {resent ? (
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--accent)" }}>Verification email resent!</p>
      ) : (
        <button onClick={handleResend} disabled={loading || !email} className="btn btn-ghost" style={{ justifyContent: "center", width: "100%" }}>
          {loading ? "Sending…" : "Resend verification email"}
        </button>
      )}
    </AuthShell>
  );
}

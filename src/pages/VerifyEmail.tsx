import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../lib/auth-api";
import { AuthShell } from "../components/AuthShell";
import { Check, X } from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Missing verification token"); return; }
    verifyEmail(token)
      .then(res => { setStatus(res.success ? "success" : "error"); setMessage(res.message); })
      .catch(() => { setStatus("error"); setMessage("Verification failed. The link may have expired."); });
  }, [token]);

  return (
    <AuthShell
      title={
        status === "loading" ? "Verifying…" :
        status === "success" ? <><span className="font-serif" style={{ color: "var(--accent)" }}>Verified.</span> You're in.</> :
        "Verification failed."
      }
      side={
        <div style={{ position: "absolute", inset: 0, padding: 48, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {status === "success" && (
            <div className="glass-card-static" style={{ padding: 0, overflow: "hidden" }}>
              {[["Pair up to 5 devices","Phone, laptop, tablet, NAS",true],["Unlimited transfer size","No 2GB cap, ever",true],["Invite family later","Any time from Account",true],["Self-host your relay","docs.vinctum.io/selfhost",false]].map(([t,s,ok],i,arr) => (
                <div key={i} className="flex items-center gap-3" style={{ padding: "16px 20px", borderBottom: i < arr.length-1 ? "1px solid var(--line)" : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: ok ? "oklch(0.78 0.15 160 / .08)" : "oklch(1 0 0 / .02)", border: `1px solid ${ok ? "oklch(0.78 0.15 160 / .2)" : "var(--line-2)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: ok ? "var(--accent)" : "var(--muted)", flexShrink: 0 }}>
                    {ok ? <Check size={13} /> : <X size={13} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>{t}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      }
    >
      {status === "loading" && <p style={{ fontSize: 14, color: "var(--muted)" }}>Verifying your email…</p>}
      {status === "success" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="glass-card-static" style={{ padding: 20, background: "oklch(0.78 0.15 160 / .04)", borderColor: "oklch(0.78 0.15 160 / .2)" }}>
            <p style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.6, margin: 0 }}>{message}</p>
          </div>
          <Link to="/login" className="btn btn-primary" style={{ justifyContent: "center", padding: "11px 16px" }}>Sign in</Link>
          <Link to="/devices" className="btn btn-ghost" style={{ justifyContent: "center", padding: "11px 16px" }}>Pair your first device</Link>
        </div>
      )}
      {status === "error" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="glass-card-static" style={{ padding: 20, background: "oklch(0.72 0.17 25 / .04)", borderColor: "oklch(0.72 0.17 25 / .2)" }}>
            <p style={{ fontSize: 14, color: "var(--red)", lineHeight: 1.6, margin: 0 }}>{message}</p>
          </div>
          <Link to="/login" className="btn btn-ghost" style={{ justifyContent: "center", padding: "11px 16px" }}>Back to sign in</Link>
        </div>
      )}
    </AuthShell>
  );
}

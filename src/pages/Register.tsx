import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { AuthShell } from "../components/AuthShell";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await register({ username, email, password });
      navigate(`/check-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : password.match(/[A-Z]/) && password.match(/[0-9]/) ? 4 : 3;
  const strengthColors = ["var(--line-2)","var(--red)","var(--amber)","var(--amber)","var(--accent)"];

  return (
    <AuthShell
      title={<>Create your <span className="font-serif" style={{ color: "var(--accent)" }}>root identity.</span></>}
      subtitle="Your keypair is generated on this device and never leaves it."
      footer={<p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}>Already have an account? <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>Sign in</Link></p>}
      side={
        <div style={{ position: "absolute", inset: 0, padding: 48, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="glass-card-static" style={{ padding: 24 }}>
            <div style={{ fontSize: 11, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".09em", marginBottom: 16, fontWeight: 600 }}>Generating root identity</div>
            <pre className="font-mono" style={{ margin: 0, fontSize: 11, lineHeight: 1.7, color: "var(--fg-2)" }}>
{`// public (shareable)
pk = 8f3a2c9b7d1e4a6f8c2b…

// private (stays on device)
sk = ⋯ Secure Enclave ⋯`}
            </pre>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
            {[["Entropy","256 bits",true],["Enclave","Apple T2",true],["Curve","Ed25519",true],["Recovery","12 words",false]].map(([l,v,ok]) => (
              <div key={l as string} className="flat-card" style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".07em" }}>{l}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="font-mono" style={{ fontSize: 12, color: "var(--fg)" }}>{v}</span>
                  <span className={`pill ${ok ? "pill-ok" : "pill-warn"}`}>{ok ? "ok" : "pending"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500, display: "block", marginBottom: 6 }}>Username</label>
            <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="vt-input" placeholder="johndoe" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500, display: "block", marginBottom: 6 }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="vt-input" placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500, display: "block", marginBottom: 6 }}>Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="vt-input" placeholder="At least 8 characters" />
          <div className="flex gap-1 mt-2">
            {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: strength >= i ? strengthColors[strength] : "var(--line-2)" }} />)}
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500, display: "block", marginBottom: 6 }}>Confirm password</label>
          <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="vt-input" placeholder="Repeat password" />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent: "center", padding: "11px 16px", marginTop: 2 }}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}

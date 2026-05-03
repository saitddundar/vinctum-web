import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { AuthShell } from "../components/AuthShell";
import { Monitor, Smartphone, Tablet, Server } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.error || "Login failed";
      if (msg.includes("email not verified")) {
        navigate(`/check-email?email=${encodeURIComponent(email)}`);
        return;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={<>Welcome back to <span className="font-serif" style={{ color: "var(--accent)" }}>the mesh.</span></>}
      subtitle="Sign in to resume your encrypted sessions."
      footer={<p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}>No account? <Link to="/register" style={{ color: "var(--accent)", textDecoration: "none" }}>Create one</Link></p>}
      side={<LoginSide />}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500, display: "block", marginBottom: 7 }}>Email</label>
          <input
            type="email" required value={email}
            onChange={e => setEmail(e.target.value)}
            className="vt-input" placeholder="you@example.com"
          />
        </div>
        <div>
          <div className="flex justify-between items-center" style={{ marginBottom: 7 }}>
            <label style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500 }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: 11.5, color: "var(--accent)", textDecoration: "none" }}>Forgot?</Link>
          </div>
          <input
            type="password" required value={password}
            onChange={e => setPassword(e.target.value)}
            className="vt-input" placeholder="••••••••"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="btn btn-primary"
          style={{ justifyContent: "center", padding: "11px 16px", marginTop: 4 }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}

function LoginSide() {
  return (
    <div style={{ position: "absolute", inset: 0, padding: 48, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="glass-card-static" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "oklch(0.78 0.15 160 / .1)",
            border: "1px solid oklch(0.78 0.15 160 / .25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--accent)",
          }}>
            <Monitor size={15} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>Last sign-in</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>2h ago · Istanbul, TR · macOS 15.2</div>
          </div>
          <span className="chip chip-emerald">verified</span>
        </div>
        <div className="flat-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, color: "var(--muted-2)", letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>Paired devices</div>
          <div className="flex gap-2">
            {[Monitor, Smartphone, Tablet, Server].map((Icon, i) => (
              <div key={i} style={{
                flex: 1, padding: "10px 6px", borderRadius: 8,
                background: "oklch(1 0 0 / .02)", border: "1px solid var(--line)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              }}>
                <Icon size={15} style={{ color: "var(--fg-2)" }} />
                <div style={{ fontSize: 8, color: "var(--muted-2)", letterSpacing: ".05em" }}>ONLINE</div>
              </div>
            ))}
          </div>
        </div>
        <div className="font-mono" style={{ fontSize: 10.5, color: "var(--muted-2)", lineHeight: 1.7 }}>
          <div><span style={{ color: "var(--accent)" }}>●</span> relay.eu-west · <span style={{ color: "var(--fg-2)" }}>18ms</span></div>
          <div><span style={{ color: "var(--accent)" }}>●</span> relay.eu-central · <span style={{ color: "var(--fg-2)" }}>24ms</span></div>
          <div><span style={{ color: "var(--muted-2)" }}>○</span> relay.us-east · <span style={{ color: "var(--muted)" }}>142ms</span></div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 22, lineHeight: 1.35, letterSpacing: "-0.015em", color: "var(--fg)", maxWidth: 420, marginBottom: 16 }}>
          <span className="font-serif" style={{ color: "var(--accent)" }}>"</span>
          I stopped uploading my shoots to anything. My laptop talks to my iPad directly.
          <span className="font-serif" style={{ color: "var(--accent)" }}>"</span>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--muted)" }}>— Raphaël Zhou, photographer</div>
      </div>
    </div>
  );
}

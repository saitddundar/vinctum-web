import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicHeader() {
  const { user } = useAuth();
  const signedIn = !!user;

  return (
    <header style={{ borderBottom: "1px solid var(--line)", position: "sticky", top: 0, zIndex: 10, background: "oklch(0.155 0.012 235 / .85)", backdropFilter: "blur(12px)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2" style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em", textDecoration: "none", color: "var(--fg)" }}>
            <span className="logo-mark" />
            vinctum
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: "Product", to: "/product" },
              { label: "Protocol", to: "/protocol" },
              { label: "Security", to: "/security" },
              { label: "Pricing", to: "/pricing" },
              { label: "Docs", to: "/docs" },
            ].map(l => (
              <Link key={l.label} to={l.to} style={{ fontSize: 13, color: "var(--muted)", fontWeight: 450, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--fg-2)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            <span style={{ color: "var(--accent)", marginRight: 5 }}>●</span>all systems operational
          </span>
          {signedIn ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost" style={{ padding: "7px 13px", fontSize: 12 }}>Dashboard</Link>
              <Link to="/account" style={{ width: 28, height: 28, borderRadius: 99, background: "linear-gradient(135deg,var(--accent),var(--cyan))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#06170f", textDecoration: "none", cursor: "pointer" }}>
                {user?.username?.slice(0, 2).toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" style={{ padding: "7px 13px", fontSize: 12 }}>Sign in</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: "7px 13px", fontSize: 12 }}>Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

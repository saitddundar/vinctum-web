import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicHeader() {
  const { user } = useAuth();
  const signedIn = !!user;

  return (
    <div style={{ position: "sticky", top: 24, zIndex: 50, padding: "0 24px", display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <header style={{ width: "100%", maxWidth: 1160, height: 60, background: "oklch(0.14 0.012 235 / .85)", backdropFilter: "blur(16px)", border: "1px solid var(--line)", borderRadius: 16, padding: "0 12px 0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", pointerEvents: "auto", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}>
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2" style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.02em", textDecoration: "none", color: "var(--fg)" }}>
            vinctum
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {[
              { label: "Product", to: "/product" },
              { label: "Protocol", to: "/protocol" },
              { label: "Security", to: "/security" },
              { label: "Pricing", to: "/pricing" },
              { label: "Docs", to: "/docs" },
            ].map(l => (
              <Link key={l.label} to={l.to} style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 450, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--fg)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden lg:inline-block" style={{ fontSize: 11, color: "var(--muted)", marginRight: 12 }}>
            <span style={{ color: "var(--accent)", marginRight: 5 }}>●</span>all systems operational
          </span>
          {signedIn ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: 13, borderRadius: 99 }}>Dashboard</Link>
              <Link to="/account" style={{ width: 34, height: 34, borderRadius: 99, background: "linear-gradient(135deg,var(--accent),var(--cyan))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#06170f", textDecoration: "none", cursor: "pointer", marginLeft: 4 }}>
                {user?.username?.slice(0, 2).toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: 13, borderRadius: 99 }}>Sign in</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: "8px 20px", fontSize: 13, borderRadius: 99 }}>Get started</Link>
            </>
          )}
        </div>
      </header>
    </div>
  );
}

import { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import {
  Activity, Monitor, Users, Send, Network, Shield,
  Settings, LogOut, Bell, Search, X, Menu, Download,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Overview",   Icon: Activity },
  { to: "/transfers", label: "Transfers",  Icon: Send },
  { to: "/incoming",  label: "Receive",    Icon: Download },
  { to: "/devices",   label: "Devices",    Icon: Monitor },
  { to: "/sessions",  label: "Sessions",   Icon: Users },
  { to: "/nodes",     label: "Nodes",      Icon: Network },
  { to: "/anomalies", label: "Security",   Icon: Shield },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,.5)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-200 md:translate-x-0 md:static md:z-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: 220,
          background: "oklch(0.148 0.012 235)",
          borderRight: "1px solid var(--line)",
          flexShrink: 0,
        }}
      >
        {/* Wordmark */}
        <div
          className="flex items-center justify-between"
          style={{ padding: "22px 20px 18px", borderBottom: "1px solid var(--line)" }}
        >
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
            <span className="logo-mark" />
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--fg)" }}>
              vinctum
            </span>
          </Link>
          <button
            className="md:hidden"
            onClick={() => setOpen(false)}
            style={{ color: "var(--muted-2)", background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <Icon size={14} />
              <span style={{ flex: 1 }}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Mesh pulse */}
        <div style={{ margin: "0 10px 10px", padding: "10px 12px", borderRadius: 9, border: "1px solid var(--line)", background: "oklch(1 0 0 / .015)" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".09em", fontWeight: 600 }}>Mesh</span>
            <div className="flex items-center gap-1.5">
              <span className="live-dot" />
              <span style={{ fontSize: 10, color: "var(--fg-2)" }}>live</span>
            </div>
          </div>
          <div className="flex gap-4">
            {[["Peers", "4/5"], ["Latency", "18ms"], ["Uptime", "99%"]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 9, color: "var(--muted-2)", letterSpacing: ".07em", textTransform: "uppercase" }}>{l}</div>
                <div className="font-mono" style={{ fontSize: 14, color: "var(--fg)", letterSpacing: "-0.02em", marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* User */}
        <div style={{ borderTop: "1px solid var(--line)", padding: "12px 10px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 99,
            background: "oklch(0.78 0.15 160 / .15)",
            border: "1px solid oklch(0.78 0.15 160 / .3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 600, color: "var(--accent)", flexShrink: 0,
          }}>
            {user?.username?.slice(0, 2).toUpperCase() ?? "??"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "var(--fg)", fontWeight: 500, lineHeight: 1.3 }}>{user?.username}</div>
            <div style={{ fontSize: 10, color: "var(--muted-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Personal · free</div>
          </div>
          <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-2)", padding: 4 }}>
            <LogOut size={13} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <header style={{
          height: 58, borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", padding: "0 32px", gap: 16,
          background: "oklch(0.152 0.012 235 / .7)", backdropFilter: "blur(10px)",
          position: "sticky", top: 0, zIndex: 30,
        }}>
          {/* Mobile menu */}
          <button
            className="md:hidden"
            onClick={() => setOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
          >
            <Menu size={18} />
          </button>

          <div style={{ flex: 1 }} />

          {/* Search */}
          <div className="hidden md:flex items-center gap-2" style={{
            padding: "7px 13px", border: "1px solid var(--line)", borderRadius: 9,
            background: "oklch(1 0 0 / .02)", width: 240, cursor: "text",
          }}>
            <Search size={12} style={{ color: "var(--muted-2)" }} />
            <span style={{ fontSize: 12, color: "var(--muted-2)", flex: 1 }}>Search…</span>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)", background: "oklch(1 0 0 / .06)", padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>

          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button style={{
              width: 32, height: 32, borderRadius: 9, border: "1px solid var(--line)",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "none", cursor: "pointer", color: "var(--muted)",
            }}>
              <Bell size={14} />
            </button>
            <span style={{
              position: "absolute", top: 6, right: 6,
              width: 6, height: 6, borderRadius: 99,
              background: "var(--amber)", border: "1.5px solid oklch(0.152 0.012 235)",
            }} />
          </div>

          {/* Settings link */}
          <Link to="/account">
            <button style={{
              width: 32, height: 32, borderRadius: 9, border: "1px solid var(--line)",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "none", cursor: "pointer", color: "var(--muted)",
            }}>
              <Settings size={14} />
            </button>
          </Link>

          {/* Send file */}
          <Link to="/transfers" className="btn btn-primary" style={{ fontSize: 12, padding: "7px 13px" }}>
            <Send size={12} />
            Send file
          </Link>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "32px", maxWidth: 1200, width: "100%", margin: "0 auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

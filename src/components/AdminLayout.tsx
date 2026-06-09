import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Users, Monitor, ArrowLeftRight, FileText, Server, ArrowLeft } from "lucide-react";

const NAV = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", Icon: Users },
  { to: "/admin/devices", label: "Devices", Icon: Monitor },
  { to: "/admin/transfers", label: "Transfers", Icon: ArrowLeftRight },
  { to: "/admin/audit-logs", label: "Audit Logs", Icon: FileText },
  { to: "/admin/services", label: "Services", Icon: Server },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <aside style={{ width: 220, background: "oklch(0.148 0.012 235)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid var(--line)" }}>
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: "none", marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--fg)" }}>
              vinctum
            </span>
          </Link>
          <span className="pill pill-warn" style={{ fontSize: 9 }}>ADMIN</span>
        </div>

        {/* Nav */}
        <nav style={{ padding: "8px 6px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <Icon size={14} />
              <span style={{ flex: 1 }}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Back to app */}
        <div style={{ borderTop: "1px solid var(--line)", padding: "12px 10px" }}>
          <Link to="/dashboard" className="nav-item" style={{ color: "var(--muted)" }}>
            <ArrowLeft size={14} />
            Back to app
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "32px 40px", maxWidth: 1200 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

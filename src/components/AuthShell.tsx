import { Link } from "react-router-dom";

interface AuthShellProps {
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  side: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, side, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Form side */}
      <div className="flex flex-col" style={{ flex: "0 0 480px", padding: "48px 56px", background: "var(--bg)", minHeight: "100vh" }}>
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: "none", marginBottom: 48 }}>
          <span className="logo-mark" />
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--fg)" }}>vinctum</span>
        </Link>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 380, width: "100%" }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0 }}>{title}</h1>
            {subtitle && <p style={{ fontSize: 14, color: "var(--fg-2)", marginTop: 10, lineHeight: 1.55 }}>{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <div style={{ marginTop: 32 }}>{footer}</div>}
      </div>
      {/* Side panel */}
      <div className="hidden md:block flex-1 relative overflow-hidden grid-bg" style={{ background: "oklch(0.14 0.012 235)", borderLeft: "1px solid var(--line)" }}>
        {side}
      </div>
    </div>
  );
}

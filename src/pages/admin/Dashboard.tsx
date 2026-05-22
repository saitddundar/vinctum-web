import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Monitor, ArrowLeftRight, FileText, ArrowRight } from "lucide-react";
import { getPlatformStats, type PlatformStats } from "../../lib/api";
import { adminListAuditLogs, type AuditLogEntry } from "../../lib/admin-api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    getPlatformStats().then(setStats).catch(() => {});
    adminListAuditLogs(10, 0).then(d => setRecentLogs(d.logs || [])).catch(() => {});
  }, []);

  const cards = [
    { label: "Total Users", value: stats?.total_users ?? "—", icon: Users, color: "var(--accent)", to: "/admin/users" },
    { label: "Total Devices", value: stats?.total_devices ?? "—", icon: Monitor, color: "var(--cyan)", to: "/admin/devices" },
    { label: "Total Transfers", value: stats?.total_transfers ?? "—", icon: ArrowLeftRight, color: "var(--violet)", to: "/admin/transfers" },
    { label: "Bytes Transferred", value: stats ? formatBytes(stats.total_bytes) : "—", icon: FileText, color: "var(--amber)", to: "/admin/transfers" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 8px" }}>Admin Dashboard</h1>
      <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 32px" }}>Platform overview and recent activity.</p>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 32 }}>
        {cards.map(c => (
          <Link key={c.label} to={c.to} className="glass-card" style={{ padding: "22px 20px", textDecoration: "none", color: "var(--fg)" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{c.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `color-mix(in oklch, ${c.color}, transparent 90%)`, border: `1px solid color-mix(in oklch, ${c.color}, transparent 75%)`, color: c.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <c.icon size={14} />
              </div>
            </div>
            <div className="font-mono" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em" }}>{c.value}</div>
          </Link>
        ))}
      </div>

      {/* Recent audit logs */}
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>Recent Activity</h2>
        <Link to="/admin/audit-logs" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          View all <ArrowRight size={12} />
        </Link>
      </div>
      <div className="flat-card" style={{ overflow: "hidden", padding: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 80px 80px 160px", padding: "10px 16px", borderBottom: "1px solid var(--line)", background: "oklch(0.12 0.012 235)" }}>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>METHOD</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>USER</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>CODE</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>DURATION</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>TIME</span>
        </div>
        {recentLogs.length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--muted)" }}>No activity yet</div>
        ) : recentLogs.map(log => (
          <div key={log.id} style={{ display: "grid", gridTemplateColumns: "1fr 200px 80px 80px 160px", padding: "10px 16px", borderBottom: "1px solid var(--line)", alignItems: "center" }}>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--fg-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {log.method.split("/").pop()}
            </span>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis" }}>
              {log.user_id ? log.user_id.slice(0, 8) + "..." : "—"}
            </span>
            <span className={`pill ${log.code === "OK" ? "pill-ok" : "pill-bad"}`} style={{ fontSize: 9 }}>{log.code}</span>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>{log.duration_ms}ms</span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{new Date(log.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val < 10 ? val.toFixed(1) : Math.round(val)} ${units[i]}`;
}

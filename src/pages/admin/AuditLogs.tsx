import { useState, useEffect } from "react";
import { adminListAuditLogs, type AuditLogEntry } from "../../lib/admin-api";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    adminListAuditLogs(limit, page * limit)
      .then(d => { setLogs(d.logs || []); setTotal(d.total ?? 0); })
      .catch(() => {});
  }, [page]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Audit Logs</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>{total} total entries</p>
      </div>

      <div className="flat-card" style={{ overflow: "hidden", padding: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 80px 120px 80px 160px", padding: "10px 16px", borderBottom: "1px solid var(--line)", background: "oklch(0.12 0.012 235)" }}>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>METHOD</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>USER ID</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>CODE</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>PEER</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>DURATION</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>TIME</span>
        </div>
        {logs.length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--muted)" }}>No logs found</div>
        ) : logs.map(log => (
          <div key={log.id} style={{ display: "grid", gridTemplateColumns: "1fr 160px 80px 120px 80px 160px", padding: "10px 16px", borderBottom: "1px solid var(--line)", alignItems: "center" }}>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--fg-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {log.method.replace(/^\/[^/]+\//, "")}
            </span>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis" }}>
              {log.user_id || "—"}
            </span>
            <span className={`pill ${log.code === "OK" ? "pill-ok" : log.code === "Unauthenticated" ? "pill-warn" : "pill-bad"}`} style={{ fontSize: 9 }}>
              {log.code}
            </span>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)" }}>{log.peer_addr || "—"}</span>
            <span className="font-mono" style={{ fontSize: 11, color: log.duration_ms > 100 ? "var(--amber)" : "var(--muted)" }}>
              {log.duration_ms}ms
            </span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{new Date(log.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {total > limit && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ fontSize: 12 }}>Previous</button>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>{page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}</span>
          <button className="btn btn-ghost" disabled={(page + 1) * limit >= total} onClick={() => setPage(p => p + 1)} style={{ fontSize: 12 }}>Next</button>
        </div>
      )}
    </div>
  );
}

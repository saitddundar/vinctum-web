import { useState, useEffect } from "react";
import { adminListTransfers, type AdminTransfer } from "../../lib/admin-api";

const statusLabel: Record<number, [string, string]> = {
  0: ["Unknown", "pill-muted"],
  1: ["Pending", "pill-warn"],
  2: ["In Progress", "pill-info"],
  3: ["Completed", "pill-ok"],
  4: ["Failed", "pill-bad"],
  5: ["Cancelled", "pill-muted"],
  6: ["Awaiting", "pill-warn"],
};

const modeLabel: Record<number, string> = { 0: "—", 1: "Relay", 2: "P2P Direct", 3: "P2P Relayed" };

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val < 10 ? val.toFixed(1) : Math.round(val)} ${units[i]}`;
}

export default function AdminTransfers() {
  const [transfers, setTransfers] = useState<AdminTransfer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 25;

  useEffect(() => {
    adminListTransfers(limit, page * limit)
      .then(d => { setTransfers(d.transfers || []); setTotal(d.total ?? 0); })
      .catch(() => {});
  }, [page]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Transfers</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>{total} total transfers</p>
      </div>

      <div className="flat-card" style={{ overflow: "hidden", padding: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 100px 80px 100px 80px 150px", padding: "10px 16px", borderBottom: "1px solid var(--line)", background: "oklch(0.12 0.012 235)" }}>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>FILENAME</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>SIZE</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>STATUS</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>PROGRESS</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>MODE</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>CREATED</span>
        </div>
        {transfers.map(t => {
          const [label, cls] = statusLabel[t.status] || ["Unknown", "pill-muted"];
          const progress = t.total_chunks > 0 ? Math.round((t.chunks_done / t.total_chunks) * 100) : 0;
          return (
            <div key={t.transfer_id} style={{ display: "grid", gridTemplateColumns: "1.2fr 100px 80px 100px 80px 150px", padding: "12px 16px", borderBottom: "1px solid var(--line)", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 450, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.filename}</span>
              <span className="font-mono" style={{ fontSize: 12, color: "var(--fg-2)" }}>{formatBytes(t.total_size_bytes)}</span>
              <span className={`pill ${cls}`} style={{ fontSize: 9 }}>{label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--line-2)", overflow: "hidden" }}>
                  <div style={{ width: `${progress}%`, height: "100%", borderRadius: 2, background: "var(--accent)" }} />
                </div>
                <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)" }}>{progress}%</span>
              </div>
              <span className="chip" style={{ fontSize: 10 }}>{modeLabel[t.transfer_mode] || "—"}</span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{new Date(t.created_at).toLocaleString()}</span>
            </div>
          );
        })}
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

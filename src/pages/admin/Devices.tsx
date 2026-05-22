import { useState, useEffect } from "react";
import { adminListDevices, type AdminDevice } from "../../lib/admin-api";

const deviceTypeLabel: Record<number, string> = { 0: "Unknown", 1: "PC", 2: "Phone", 3: "Tablet" };

export default function AdminDevices() {
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 25;

  useEffect(() => {
    adminListDevices(limit, page * limit)
      .then(d => { setDevices(d.devices || []); setTotal(d.total ?? 0); })
      .catch(() => {});
  }, [page]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Devices</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>{total} active devices</p>
      </div>

      <div className="flat-card" style={{ overflow: "hidden", padding: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px 80px 140px", padding: "10px 16px", borderBottom: "1px solid var(--line)", background: "oklch(0.12 0.012 235)" }}>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>NAME</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>OWNER</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>TYPE</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>STATUS</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>PUBLIC</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>LAST ACTIVE</span>
        </div>
        {devices.map(d => (
          <div key={d.device_id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px 80px 140px", padding: "12px 16px", borderBottom: "1px solid var(--line)", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</span>
            <div>
              <div style={{ fontSize: 12, color: "var(--fg-2)" }}>{d.owner_username}</div>
              <div className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>{d.owner_email}</div>
            </div>
            <span className="chip" style={{ fontSize: 10 }}>{deviceTypeLabel[d.device_type] || "PC"}</span>
            <span>
              {d.is_revoked
                ? <span className="pill pill-bad" style={{ fontSize: 9 }}>Revoked</span>
                : d.is_approved
                  ? <span className="pill pill-ok" style={{ fontSize: 9 }}>Active</span>
                  : <span className="pill pill-warn" style={{ fontSize: 9 }}>Pending</span>
              }
            </span>
            <span>{d.is_public ? <span className="pill pill-info" style={{ fontSize: 9 }}>Public</span> : <span className="pill pill-muted" style={{ fontSize: 9 }}>Private</span>}</span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{new Date(d.last_active).toLocaleString()}</span>
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

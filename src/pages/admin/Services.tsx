import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { adminGetServices, type ServiceStatus } from "../../lib/admin-api";

export default function AdminServices() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(false);

  function refresh() {
    setLoading(true);
    adminGetServices()
      .then(d => setServices(d.services || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, []);

  const healthy = services.filter(s => s.healthy).length;
  const total = services.length;

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Services</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>
            {healthy}/{total} services healthy
          </p>
        </div>
        <button className="btn btn-ghost" onClick={refresh} disabled={loading} style={{ fontSize: 12 }}>
          <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
        {services.map(s => (
          <div key={s.name} className="glass-card-static" style={{ padding: "24px 22px" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <div className="flex items-center gap-3">
                <span className={`live-dot`} style={{ background: s.healthy ? "var(--accent)" : "var(--red)" }} />
                <span style={{ fontSize: 16, fontWeight: 500, textTransform: "capitalize" }}>{s.name}</span>
              </div>
              <span className={`pill ${s.healthy ? "pill-ok" : "pill-bad"}`} style={{ fontSize: 9 }}>
                {s.healthy ? "HEALTHY" : "DOWN"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)", marginBottom: 4 }}>ADDRESS</div>
                <div className="font-mono" style={{ fontSize: 12, color: "var(--fg-2)" }}>{s.address}</div>
              </div>
              <div>
                <div className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)", marginBottom: 4 }}>LATENCY</div>
                <div className="font-mono" style={{ fontSize: 12, color: s.latency_ms > 50 ? "var(--amber)" : "var(--accent)" }}>
                  {s.latency_ms}ms
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && !loading && (
        <div className="flat-card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--muted)" }}>
          No services found. Make sure the backend is running.
        </div>
      )}
    </div>
  );
}

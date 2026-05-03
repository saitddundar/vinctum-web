import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listDevices, listPeerSessions } from "../lib/device-api";
import { listTransfers } from "../lib/transfer-api";
import { normalizeDeviceType } from "../types/device";
import type { Device, PeerSession } from "../types/device";
import type { TransferInfo } from "../types/transfer";
import NetworkMesh from "../components/NetworkMesh";
import { Monitor, Smartphone, Tablet, Server, ArrowRight, Check, Users, Send, Shield, QrCode } from "lucide-react";

function timeAgo(iso: string) {
  if (!iso) return "never";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatBytes(b: number) {
  if (!b) return "0 B";
  const k = 1024, s = ["B","KB","MB","GB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${parseFloat((b / k ** i).toFixed(1))} ${s[i]}`;
}

const STATUS_COLOR: Record<string, string> = {
  TRANSFER_STATUS_PENDING:     "var(--amber)",
  TRANSFER_STATUS_IN_PROGRESS: "var(--amber)",
  TRANSFER_STATUS_COMPLETED:   "var(--accent)",
  TRANSFER_STATUS_FAILED:      "var(--red)",
  TRANSFER_STATUS_CANCELLED:   "var(--muted-2)",
};
const STATUS_LABEL: Record<string, string> = {
  TRANSFER_STATUS_PENDING:     "Pending",
  TRANSFER_STATUS_IN_PROGRESS: "Transferring",
  TRANSFER_STATUS_COMPLETED:   "Completed",
  TRANSFER_STATUS_FAILED:      "Failed",
  TRANSFER_STATUS_CANCELLED:   "Cancelled",
};

function DeviceIcon({ type, size = 14 }: { type: string; size?: number }) {
  const t = normalizeDeviceType(type as any);
  const style = { color: "var(--fg-2)" };
  if (t === "phone")  return <Smartphone size={size} style={style} />;
  if (t === "tablet") return <Tablet     size={size} style={style} />;
  return <Monitor size={size} style={style} />;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [devices,   setDevices]   = useState<Device[]>([]);
  const [sessions,  setSessions]  = useState<PeerSession[]>([]);
  const [transfers, setTransfers] = useState<TransferInfo[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      listDevices().catch(() => ({ devices: [] })),
      listPeerSessions().catch(() => ({ sessions: [] })),
    ]).then(async ([devRes, sessRes]) => {
      const devs: Device[] = devRes.devices || [];
      setDevices(devs);
      setSessions(sessRes.sessions || []);
      const approved = devs.find((d: Device) => d.is_approved && !d.is_revoked && d.node_id);
      if (approved) {
        try {
          const txRes = await listTransfers(approved.node_id);
          setTransfers(txRes.transfers || []);
        } catch {}
      }
    }).finally(() => setLoading(false));
  }, []);

  const approved    = devices.filter(d => d.is_approved && !d.is_revoked);
  const pending     = devices.filter(d => !d.is_approved && !d.is_revoked);
  const active      = sessions.filter(s => s.is_active);
  const inFlight    = transfers.filter(t => t.status === "TRANSFER_STATUS_IN_PROGRESS" || t.status === "TRANSFER_STATUS_PENDING");
  const recent      = transfers.slice(0, 8);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {[1,2,3].map(i => <div key={i} className="glass-card-static animate-pulse" style={{ height: 80 }} />)}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Welcome */}
      <div className="flex items-end justify-between">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>
            {greeting}{user?.username ? `, ${user.username}` : ""}.
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--fg-2)", marginTop: 6, marginBottom: 0 }}>
            {approved.length} device{approved.length !== 1 ? "s" : ""} online
            {pending.length > 0 && <span style={{ color: "var(--amber)", marginLeft: 8 }}>· {pending.length} pending approval</span>}
            {active.length > 0 && <span style={{ color: "var(--muted)", marginLeft: 8 }}>· {active.length} active session{active.length !== 1 ? "s" : ""}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span style={{ fontSize: 12, color: "var(--fg-2)" }}>
            {inFlight.length > 0 ? `${inFlight.length} transfer${inFlight.length !== 1 ? "s" : ""} in progress` : "mesh idle"}
          </span>
        </div>
      </div>

      {/* Active transfers — only shown if something is happening */}
      {inFlight.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {inFlight.map(t => (
            <div key={t.transfer_id} style={{ border: "1px solid oklch(0.84 0.13 85 / .28)", borderRadius: 12, background: "oklch(0.84 0.13 85 / .04)", padding: "18px 22px", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="flex items-center gap-2.5">
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--amber)", boxShadow: "0 0 0 3px oklch(0.84 0.13 85 / .25)", flexShrink: 0 }} />
                  <span className="font-mono" style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>{t.filename}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{formatBytes(t.total_size_bytes)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 3, borderRadius: 99, background: "oklch(1 0 0 / .07)", overflow: "hidden", maxWidth: 400 }}>
                    <div style={{ width: `${t.progress_percent || 0}%`, height: "100%", background: "var(--amber)", borderRadius: 99 }} />
                  </div>
                  <span className="font-mono" style={{ fontSize: 11, color: "var(--fg-2)", minWidth: 32 }}>{t.progress_percent || 0}%</span>
                </div>
              </div>
              <span style={{ fontSize: 10.5, color: "var(--muted-2)" }}>{timeAgo(t.created_at)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pending approvals */}
      {pending.map(d => (
        <div key={d.device_id} className="flex items-center gap-4" style={{ padding: "14px 18px", border: "1px solid var(--line-2)", borderRadius: 10, background: "oklch(1 0 0 / .015)" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid oklch(0.78 0.15 160 / .25)", background: "oklch(0.78 0.15 160 / .07)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
            <Monitor size={14} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>"{d.name}" wants to join your mesh.</span>
            <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>
              Fingerprint: <span className="font-mono" style={{ color: "var(--fg-2)" }}>{d.fingerprint?.slice(0, 12) ?? "—"}…</span> · {timeAgo(d.created_at)}
            </span>
          </div>
          <div className="flex gap-2">
            <Link to="/devices" className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}>Review</Link>
            <Link to="/devices" className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 12 }}>Approve</Link>
          </div>
        </div>
      ))}

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }}>

        {/* Event / transfer log */}
        <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
          <div className="flex items-center justify-between" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)", background: "oklch(1 0 0 / .015)" }}>
            <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em" }}>Recent transfers</span>
            <Link to="/transfers" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>View all →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="drop-zone" style={{ margin: 16, padding: "40px 20px", textAlign: "center" }}>
              <Send size={28} style={{ color: "var(--muted-2)", margin: "0 auto 12px" }} />
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>No transfers yet</p>
              <Link to="/transfers" className="btn btn-primary" style={{ fontSize: 12, padding: "7px 14px" }}>Send your first file</Link>
            </div>
          ) : (
            recent.map((t, i) => (
              <div key={t.transfer_id} className="flex items-center gap-3" style={{ padding: "13px 20px", borderBottom: i < recent.length - 1 ? "1px solid oklch(1 0 0 / .04)" : "none" }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: STATUS_COLOR[t.status] || "var(--muted-2)", flexShrink: 0 }} />
                <span className="font-mono" style={{ fontSize: 12.5, color: "var(--fg)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.filename}</span>
                <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{formatBytes(t.total_size_bytes)}</span>
                <span style={{ fontSize: 11, color: STATUS_COLOR[t.status] || "var(--muted-2)", minWidth: 80, textAlign: "right" }}>{STATUS_LABEL[t.status] || t.status}</span>
                <span style={{ fontSize: 11, color: "var(--muted-2)", minWidth: 56, textAlign: "right" }}>{timeAgo(t.created_at)}</span>
              </div>
            ))
          )}
        </div>

        {/* Right rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Network mesh */}
          <NetworkMesh devices={devices} sessions={sessions} />

          {/* Active sessions */}
          {active.length > 0 && (
            <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
              <div className="flex items-center justify-between" style={{ padding: "13px 18px", borderBottom: "1px solid var(--line)" }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Open sessions</span>
                <Link to="/sessions" style={{ fontSize: 11.5, color: "var(--accent)", textDecoration: "none" }}>Manage →</Link>
              </div>
              {active.map((s, i) => (
                <div key={s.session_id} style={{ padding: "13px 18px", borderBottom: i < active.length - 1 ? "1px solid oklch(1 0 0 / .04)" : "none" }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                    <div className="flex items-center gap-2">
                      <span className="live-dot" style={{ width: 5, height: 5 }} />
                      <span className="font-mono" style={{ fontSize: 12, color: "var(--fg)" }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize: 10.5, color: "var(--muted-2)" }}>{timeAgo(s.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {s.devices.slice(0, 4).map((d, j) => (
                        <div key={d.device_id} style={{ width: 22, height: 22, borderRadius: 99, background: "oklch(0.22 0.014 235)", border: "2px solid var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: j > 0 ? -7 : 0 }}>
                          <DeviceIcon type={d.device_type} size={10} />
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 4 }}>{s.devices.length} device{s.devices.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--line)" }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Quick actions</span>
            </div>
            {[
              { to: "/transfers", icon: Send,   label: "Send a file",        sub: "Choose file and recipient" },
              { to: "/devices",   icon: QrCode, label: "Pair a device",      sub: "Add phone, laptop, or NAS" },
              { to: "/sessions",  icon: Users,  label: "Start a session",    sub: "Open multi-device window" },
              { to: "/anomalies", icon: Shield, label: "Security overview",  sub: "Keys, events, anomalies" },
            ].map(({ to, icon: Icon, label, sub }, i, arr) => (
              <Link key={to} to={to} className="flex items-center gap-3" style={{ padding: "12px 18px", borderBottom: i < arr.length - 1 ? "1px solid oklch(1 0 0 / .04)" : "none", textDecoration: "none" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--line)", background: "oklch(1 0 0 / .02)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-2)", flexShrink: 0 }}>
                  <Icon size={13} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-2)", marginTop: 1 }}>{sub}</div>
                </div>
                <ArrowRight size={12} style={{ color: "var(--muted-2)" }} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Devices */}
      <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
        <div className="flex items-center justify-between" style={{ padding: "14px 22px", borderBottom: "1px solid var(--line)", background: "oklch(1 0 0 / .015)" }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Your devices</span>
          <Link to="/devices" className="btn btn-ghost" style={{ padding: "5px 11px", fontSize: 11.5 }}>
            <QrCode size={12} /> Manage
          </Link>
        </div>
        {approved.length === 0 ? (
          <div className="drop-zone" style={{ margin: 16, padding: "36px", textAlign: "center" }}>
            <Monitor size={28} style={{ color: "var(--muted-2)", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>No devices registered yet</p>
            <Link to="/devices" className="btn btn-primary" style={{ fontSize: 12, padding: "7px 14px" }}>Add your first device</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px 90px 90px 80px", padding: "8px 22px", borderBottom: "1px solid var(--line)", background: "oklch(1 0 0 / .01)" }}>
            {["Device","Last seen","Sent","Received","Transfers",""].map(h => (
              <div key={h} style={{ fontSize: 10, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".09em", fontWeight: 600 }}>{h}</div>
            ))}
          </div>
        )}
        {approved.map((d, i, arr) => (
          <div key={d.device_id} style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px 90px 90px 80px", padding: "12px 22px", borderBottom: i < arr.length - 1 ? "1px solid oklch(1 0 0 / .04)" : "none", alignItems: "center" }}>
            <div className="flex items-center gap-2.5">
              <div style={{ width: 26, height: 26, borderRadius: 7, background: "oklch(1 0 0 / .02)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                <DeviceIcon type={d.device_type} size={12} />
                <span style={{ position: "absolute", bottom: -2, right: -2, width: 7, height: 7, borderRadius: 99, background: "var(--accent)", border: "1.5px solid var(--bg)" }} />
              </div>
              <span style={{ fontSize: 13, color: "var(--fg)", fontWeight: 450 }}>{d.name}</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: "var(--accent)" }}>
              <span className="live-dot" style={{ width: 5, height: 5 }} />
              {timeAgo(d.last_active)}
            </div>
            <div className="font-mono" style={{ fontSize: 11.5, color: "var(--fg-2)" }}>—</div>
            <div className="font-mono" style={{ fontSize: 11.5, color: "var(--fg-2)" }}>—</div>
            <div className="font-mono" style={{ fontSize: 11.5, color: "var(--fg-2)" }}>—</div>
            <Link to="/devices" style={{ fontSize: 11, color: "var(--muted-2)", textDecoration: "none" }}>Details →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, X } from "lucide-react";
import type { PeerSession, Device } from "../types/device";
import { normalizeDeviceType } from "../types/device";
import { listPeerSessions, createPeerSession, closePeerSession, joinPeerSession, leavePeerSession, listDevices } from "../lib/device-api";

function timeAgo(iso: string) {
  if (!iso) return "";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now"; if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Sessions() {
  const [sessions,       setSessions]       = useState<PeerSession[]>([]);
  const [devices,        setDevices]        = useState<Device[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [showCreate,     setShowCreate]     = useState(false);
  const [newName,        setNewName]        = useState("");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [creating,       setCreating]       = useState(false);
  const [addingTo,       setAddingTo]       = useState<string | null>(null);
  const [addDeviceId,    setAddDeviceId]    = useState("");

  async function fetchData() {
    try {
      const [sR, dR] = await Promise.all([listPeerSessions(), listDevices()]);
      setSessions(sR.sessions);
      setDevices(dR.devices.filter(d => d.is_approved && !d.is_revoked));
    } catch (e: any) { toast.error(e?.response?.data?.error || "Failed to load"); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleCreate() {
    if (!newName || !selectedDevice) return;
    setCreating(true);
    try { await createPeerSession({ name: newName, device_id: selectedDevice }); await fetchData(); setShowCreate(false); setNewName(""); setSelectedDevice(""); toast.success("Session created"); }
    catch (e: any) { toast.error(e?.response?.data?.error || "Failed"); }
    finally { setCreating(false); }
  }

  async function handleClose(id: string) {
    try { await closePeerSession(id); await fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.error || "Failed"); }
  }

  async function handleJoin(sessionId: string) {
    if (!addDeviceId) return;
    try { await joinPeerSession(sessionId, addDeviceId); await fetchData(); setAddingTo(null); setAddDeviceId(""); }
    catch (e: any) { toast.error(e?.response?.data?.error || "Failed"); }
  }

  async function handleLeave(sessionId: string, deviceId: string) {
    try { await leavePeerSession(sessionId, deviceId); await fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.error || "Failed"); }
  }

  function devicesNotIn(s: PeerSession) {
    const ids = new Set(s.devices.map(d => d.device_id));
    return devices.filter(d => !ids.has(d.device_id));
  }

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>Sessions</h1>
      {[1,2].map(i => <div key={i} className="glass-card-static animate-pulse" style={{ height: 100 }} />)}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div className="flex items-start justify-between">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>
            Active <span className="font-serif" style={{ color: "var(--accent)" }}>sessions</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 6, marginBottom: 0 }}>
            A session is a time-bounded transfer window between two or more devices.
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary" style={{ fontSize: 12 }}>
          <Users size={12} /> New session
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="glass-card-static" style={{ padding: 22 }}>
          <p style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500, marginBottom: 14 }}>New session</p>
          <input type="text" placeholder="Session name" value={newName} onChange={e => setNewName(e.target.value)} className="vt-input" style={{ marginBottom: 14 }} autoFocus />
          <p style={{ fontSize: 11, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10, fontWeight: 600 }}>Initial device</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
            {devices.map(d => (
              <label key={d.device_id} className="flex items-center gap-3" style={{ padding: "10px 12px", borderRadius: 9, border: `1px solid ${selectedDevice === d.device_id ? "oklch(0.78 0.15 160 / .35)" : "var(--line)"}`, background: selectedDevice === d.device_id ? "oklch(0.78 0.15 160 / .05)" : "transparent", cursor: "pointer" }}>
                <input type="radio" name="create-device" value={d.device_id} checked={selectedDevice === d.device_id} onChange={e => setSelectedDevice(e.target.value)} style={{ display: "none" }} />
                <span style={{ fontSize: 13, color: "var(--fg)" }}>{d.name}</span>
                <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{normalizeDeviceType(d.device_type as any)}</span>
                {selectedDevice === d.device_id && <span style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: 99, background: "var(--accent)" }} />}
              </label>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowCreate(false); setSelectedDevice(""); }} className="btn btn-ghost" style={{ fontSize: 12 }}>Cancel</button>
            <button onClick={handleCreate} disabled={!newName || !selectedDevice || creating} className="btn btn-primary" style={{ fontSize: 12 }}>{creating ? "Creating…" : "Create"}</button>
          </div>
        </div>
      )}

      {sessions.length === 0 && !showCreate && (
        <div className="drop-zone" style={{ padding: 48, textAlign: "center" }}>
          <Users size={30} style={{ color: "var(--muted-2)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>No active sessions</p>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary" style={{ fontSize: 12 }}>Create your first session</button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sessions.map(s => {
          const available = devicesNotIn(s);
          const isAdding = addingTo === s.session_id;
          return (
            <div key={s.session_id} className="glass-card" style={{ padding: 20 }}>
              <div className="flex items-start justify-between" style={{ marginBottom: 14 }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="live-dot" style={{ width: 5, height: 5 }} />
                    <span className="font-mono" style={{ fontSize: 13.5, color: "var(--fg)", fontWeight: 500 }}>{s.name}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>
                    {s.devices.length} device{s.devices.length !== 1 ? "s" : ""} · started {timeAgo(s.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {available.length > 0 && (
                    <button onClick={() => { setAddingTo(isAdding ? null : s.session_id); setAddDeviceId(""); }} style={{ fontSize: 11.5, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
                      {isAdding ? "Cancel" : "Add device"}
                    </button>
                  )}
                  <button onClick={() => handleClose(s.session_id)} style={{ fontSize: 11.5, color: "var(--muted-2)", background: "none", border: "none", cursor: "pointer" }}>Close</button>
                </div>
              </div>

              {isAdding && (
                <div className="flex flex-wrap gap-2" style={{ marginBottom: 14 }}>
                  {available.map(d => (
                    <label key={d.device_id} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${addDeviceId === d.device_id ? "oklch(0.78 0.15 160 / .35)" : "var(--line)"}`, background: addDeviceId === d.device_id ? "oklch(0.78 0.15 160 / .07)" : "transparent", fontSize: 12, color: addDeviceId === d.device_id ? "var(--accent)" : "var(--fg-2)", cursor: "pointer" }}>
                      <input type="radio" name="join-device" value={d.device_id} checked={addDeviceId === d.device_id} onChange={e => setAddDeviceId(e.target.value)} style={{ display: "none" }} />
                      {d.name}
                    </label>
                  ))}
                  <button onClick={() => handleJoin(s.session_id)} disabled={!addDeviceId} className="btn btn-primary" style={{ padding: "5px 12px", fontSize: 12 }}>Add</button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {s.devices.map(d => (
                  <div key={d.device_id} className="flex items-center gap-2" style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--line)", background: "oklch(1 0 0 / .02)" }}>
                    <span style={{ fontSize: 12, color: "var(--fg-2)" }}>{d.name}</span>
                    <span style={{ fontSize: 10, color: "var(--muted-2)" }}>{normalizeDeviceType(d.device_type as any)}</span>
                    <button onClick={() => handleLeave(s.session_id, d.device_id)} style={{ color: "var(--muted-2)", background: "none", border: "none", cursor: "pointer", padding: 0, marginLeft: 2, display: "flex" }}>
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

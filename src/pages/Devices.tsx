import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Monitor, Smartphone, Tablet, QrCode, MonitorSmartphone } from "lucide-react";
import type { Device } from "../types/device";
import { normalizeDeviceType, toProtoDeviceType } from "../types/device";
import { listDevices, registerDevice, revokeDevice, generatePairingCode, redeemPairingCode, approvePairing } from "../lib/device-api";
import { getDeviceFingerprint, guessDeviceType } from "../lib/fingerprint";
import { ensureDeviceKeys } from "../lib/device-key";

function timeAgo(iso: string) {
  if (!iso) return "never";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now"; if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function DeviceIcon({ type, size = 14 }: { type: string; size?: number }) {
  const t = normalizeDeviceType(type as any);
  const s = { color: "var(--fg-2)" };
  if (t === "phone")  return <Smartphone size={size} style={s} />;
  if (t === "tablet") return <Tablet     size={size} style={s} />;
  return <Monitor size={size} style={s} />;
}

type Modal = null | "add-this" | "pairing-generate" | "pairing-redeem";

export default function Devices() {
  const [devices,     setDevices]     = useState<Device[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState<Modal>(null);
  const [selected,    setSelected]    = useState<Device | null>(null);
  const [pairingCode, setPairingCode] = useState("");
  const [pairingExp,  setPairingExp]  = useState(0);
  const [addName,     setAddName]     = useState("");
  const [redeemCode,  setRedeemCode]  = useState("");
  const [redeemName,  setRedeemName]  = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const pending  = devices.filter(d => !d.is_approved && !d.is_revoked);
  const active   = devices.filter(d =>  d.is_approved && !d.is_revoked);
  const revoked  = devices.filter(d =>  d.is_revoked);

  async function fetch() {
    try { const r = await listDevices(); setDevices(r.devices); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    if (pairingExp <= 0) return;
    const t = setInterval(() => setPairingExp(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, [pairingExp > 0]);

  async function handleAddThis() {
    if (!addName) return;
    setActionLoading(true);
    try {
      const fp = await getDeviceFingerprint();
      const r = await registerDevice({ name: addName, device_type: toProtoDeviceType(guessDeviceType()), fingerprint: fp });
      try { await ensureDeviceKeys(r.device.device_id); } catch {}
      await fetch(); setModal(null); setAddName("");
      toast.success("Device registered");
    } catch { toast.error("Failed to add device"); }
    finally { setActionLoading(false); }
  }

  async function handleGeneratePairing() {
    const me = devices.find(d => d.is_approved);
    if (!me) return;
    setActionLoading(true);
    try {
      const r = await generatePairingCode(me.device_id);
      setPairingCode(r.pairing_code); setPairingExp(r.expires_in_s); setModal("pairing-generate");
    } catch { toast.error("Failed to generate pairing code"); }
    finally { setActionLoading(false); }
  }

  async function handleRedeem() {
    if (!redeemCode || !redeemName) return;
    setActionLoading(true);
    try {
      const fp = await getDeviceFingerprint();
      await redeemPairingCode({ pairing_code: redeemCode, name: redeemName, device_type: toProtoDeviceType(guessDeviceType()), fingerprint: fp });
      await fetch(); setModal(null); setRedeemCode(""); setRedeemName("");
      toast.success("Pairing code redeemed");
    } catch { toast.error("Failed to redeem pairing code"); }
    finally { setActionLoading(false); }
  }

  async function handleApprove(id: string, approve: boolean) {
    const me = devices.find(d => d.is_approved);
    if (!me) return;
    try { await approvePairing({ approver_device_id: me.device_id, pending_device_id: id, approve }); await fetch(); }
    catch { console.error("approve failed"); }
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revoke this device?")) return;
    try { await revokeDevice(id); if (selected?.device_id === id) setSelected(null); await fetch(); }
    catch { console.error("revoke failed"); }
  }

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>Devices</h1>
      {[1,2,3].map(i => <div key={i} className="glass-card-static animate-pulse" style={{ height: 64 }} />)}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>
            Devices in your <span className="font-serif" style={{ color: "var(--accent)" }}>mesh</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 6, marginBottom: 0 }}>
            {active.length} approved · {pending.length} pending · {revoked.length} revoked
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal("add-this")} className="btn btn-ghost" style={{ fontSize: 12 }}>Register this device</button>
          <button onClick={handleGeneratePairing} className="btn btn-ghost" style={{ fontSize: 12 }}><QrCode size={12} /> Pairing code</button>
          <button onClick={() => setModal("pairing-redeem")} className="btn btn-primary" style={{ fontSize: 12 }}>Join with code</button>
        </div>
      </div>

      {/* Pairing flow info */}
      <div className="glass-card-static" style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: 10, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".09em", fontWeight: 600, marginBottom: 12 }}>Pairing flow</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            ["1. Generate", "Create a one-time pairing code on an approved device."],
            ["2. Redeem",   "Enter the code from the new device and submit fingerprint."],
            ["3. Approve",  "Review the pending request and confirm trusted access."],
          ].map(([t, d]) => (
            <div key={t} style={{ padding: "12px 14px", borderRadius: 9, background: "oklch(0.78 0.15 160 / .04)", border: "1px solid oklch(0.78 0.15 160 / .15)" }}>
              <div style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500, marginBottom: 5 }}>{t}</div>
              <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending approvals */}
      {pending.length > 0 && (
        <div style={{ border: "1px solid oklch(0.84 0.13 85 / .25)", borderRadius: 12, background: "oklch(0.84 0.13 85 / .03)", overflow: "hidden" }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid oklch(0.84 0.13 85 / .15)" }}>
            <span style={{ fontSize: 11, color: "var(--amber)", textTransform: "uppercase", letterSpacing: ".09em", fontWeight: 600 }}>Pending approval</span>
          </div>
          {pending.map((d, i, arr) => (
            <div key={d.device_id} className="flex items-center gap-4" style={{ padding: "14px 20px", borderBottom: i < arr.length - 1 ? "1px solid oklch(0.84 0.13 85 / .1)" : "none" }}>
              <DeviceIcon type={d.device_type} size={15} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>{d.name}</span>
                <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)", marginLeft: 10 }}>{d.fingerprint?.slice(0, 16) ?? "—"}…</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleApprove(d.device_id, false)} className="btn btn-ghost" style={{ padding: "5px 11px", fontSize: 11.5 }}>Reject</button>
                <button onClick={() => handleApprove(d.device_id, true)}  className="btn btn-primary" style={{ padding: "5px 11px", fontSize: 11.5 }}>Approve</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Device list */}
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {active.length === 0 ? (
            <div className="drop-zone" style={{ padding: 40, textAlign: "center" }}>
              <MonitorSmartphone size={32} style={{ color: "var(--muted-2)", margin: "0 auto 12px" }} />
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>No devices registered</p>
              <button onClick={() => setModal("add-this")} className="btn btn-primary" style={{ fontSize: 12 }}>Register this device</button>
            </div>
          ) : active.map(d => (
            <button key={d.device_id} onClick={() => setSelected(selected?.device_id === d.device_id ? null : d)}
              style={{ width: "100%", textAlign: "left", padding: "14px 18px", borderRadius: 11, border: `1px solid ${selected?.device_id === d.device_id ? "oklch(0.78 0.15 160 / .35)" : "var(--line)"}`, background: selected?.device_id === d.device_id ? "oklch(0.78 0.15 160 / .04)" : "oklch(1 0 0 / .015)", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "border-color .15s" }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "oklch(1 0 0 / .02)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                <DeviceIcon type={d.device_type} size={15} />
                <span style={{ position: "absolute", bottom: -2, right: -2, width: 8, height: 8, borderRadius: 99, background: "var(--accent)", border: "2px solid var(--bg)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, color: "var(--fg)", fontWeight: 500 }}>{d.name}</div>
                {d.node_id && <div className="font-mono" style={{ fontSize: 10.5, color: "var(--muted-2)", marginTop: 2 }}>{d.node_id}</div>}
              </div>
              <span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>{timeAgo(d.last_active)}</span>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="glass-card-static" style={{ width: 280, padding: 20, alignSelf: "flex-start", flexShrink: 0 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--fg)" }}>{selected.name}</span>
              <button onClick={() => setSelected(null)} style={{ fontSize: 11, color: "var(--muted-2)", background: "none", border: "none", cursor: "pointer" }}>Close</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["Type",        normalizeDeviceType(selected.device_type as any)],
                ["Status",      selected.is_approved ? "Approved" : "Pending"],
                ["Last active", timeAgo(selected.last_active)],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-xs">
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{l}</span>
                  <span style={{ fontSize: 12, color: "var(--fg)" }}>{v}</span>
                </div>
              ))}
              {selected.node_id && (
                <div>
                  <div style={{ fontSize: 11, color: "var(--muted-2)", marginBottom: 4 }}>Node ID</div>
                  <div className="font-mono" style={{ fontSize: 10.5, color: "var(--fg-2)", wordBreak: "break-all" }}>{selected.node_id}</div>
                </div>
              )}
              {selected.fingerprint && (
                <div>
                  <div style={{ fontSize: 11, color: "var(--muted-2)", marginBottom: 4 }}>Fingerprint</div>
                  <div className="font-mono" style={{ fontSize: 10.5, color: "var(--fg-2)" }}>{selected.fingerprint.slice(0, 24)}…</div>
                </div>
              )}
            </div>
            <button onClick={() => handleRevoke(selected.device_id)} className="btn btn-danger" style={{ width: "100%", justifyContent: "center", marginTop: 16, fontSize: 12 }}>Revoke device</button>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <div onClick={() => setModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div onClick={e => e.stopPropagation()} className="glass-card-static" style={{ width: "100%", maxWidth: 400, padding: 28, boxShadow: "0 24px 48px rgba(0,0,0,.5)" }}>
            {modal === "add-this" && <>
              <div style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>Register this device</h2>
                <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 5 }}>Register the current browser as a device.</p>
              </div>
              <input type="text" placeholder="Device name" value={addName} onChange={e => setAddName(e.target.value)} className="vt-input" autoFocus style={{ marginBottom: 18 }} />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setModal(null)} className="btn btn-ghost" style={{ fontSize: 12.5 }}>Cancel</button>
                <button onClick={handleAddThis} disabled={!addName || actionLoading} className="btn btn-primary" style={{ fontSize: 12.5 }}>{actionLoading ? "Adding…" : "Add"}</button>
              </div>
            </>}
            {modal === "pairing-generate" && <>
              <h2 style={{ fontSize: 16, fontWeight: 500, margin: "0 0 6px" }}>Pairing code</h2>
              <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 24 }}>Enter this on the device you want to pair.</p>
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div className="font-mono" style={{ fontSize: 36, fontWeight: 500, letterSpacing: ".35em", color: "var(--accent)" }}>{pairingCode}</div>
                <div style={{ fontSize: 12, color: pairingExp > 0 ? "var(--muted)" : "var(--red)", marginTop: 10 }}>
                  {pairingExp > 0 ? `Expires in ${Math.floor(pairingExp / 60)}:${String(pairingExp % 60).padStart(2, "0")}` : "Code expired"}
                </div>
              </div>
              <button onClick={() => setModal(null)} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>Close</button>
            </>}
            {modal === "pairing-redeem" && <>
              <h2 style={{ fontSize: 16, fontWeight: 500, margin: "0 0 6px" }}>Join with code</h2>
              <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 18 }}>Enter the 6-character code from your other device.</p>
              <input type="text" placeholder="XXXXXX" value={redeemCode} onChange={e => setRedeemCode(e.target.value.toUpperCase().slice(0, 6))} maxLength={6} className="vt-input font-mono" style={{ textAlign: "center", fontSize: 20, letterSpacing: ".25em", marginBottom: 12 }} autoFocus />
              <input type="text" placeholder="Device name" value={redeemName} onChange={e => setRedeemName(e.target.value)} className="vt-input" style={{ marginBottom: 18 }} />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setModal(null)} className="btn btn-ghost" style={{ fontSize: 12.5 }}>Cancel</button>
                <button onClick={handleRedeem} disabled={redeemCode.length !== 6 || !redeemName || actionLoading} className="btn btn-primary" style={{ fontSize: 12.5 }}>{actionLoading ? "Submitting…" : "Submit"}</button>
              </div>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}

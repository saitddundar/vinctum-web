import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Monitor, Smartphone, Tablet, MonitorSmartphone } from "lucide-react";
import type { Device } from "../types/device";
import { normalizeDeviceType, toProtoDeviceType } from "../types/device";
import {
  listDevices,
  registerDevice,
  revokeDevice,
  generatePairingCode,
  redeemPairingCode,
  approvePairing,
} from "../lib/device-api";
import { getDeviceFingerprint, guessDeviceType } from "../lib/fingerprint";
import { ensureDeviceKeys } from "../lib/device-key";

const typeLabel: Record<string, string> = {
  pc: "Computer",
  phone: "Phone",
  tablet: "Tablet",
};

function DeviceIcon({ type, className = "w-4 h-4" }: { type: string; className?: string }) {
  switch (type) {
    case "phone": return <Smartphone className={className} />;
    case "tablet": return <Tablet className={className} />;
    default: return <Monitor className={className} />;
  }
}

function timeAgo(iso: string) {
  if (!iso) return "never";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type ModalMode = null | "add-this" | "pairing-generate" | "pairing-redeem";

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Device | null>(null);
  const [pairingCode, setPairingCode] = useState("");
  const [pairingExpiry, setPairingExpiry] = useState(0);
  const [addName, setAddName] = useState("");
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemName, setRedeemName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [fpPreview, setFpPreview] = useState("");

  useEffect(() => {
    getDeviceFingerprint().then((fp) => setFpPreview(fp));
  }, []);

  const pendingDevices = devices.filter((d) => !d.is_approved && !d.is_revoked);
  const activeDevices = devices.filter((d) => d.is_approved && !d.is_revoked);
  const revokedDevices = devices.filter((d) => d.is_revoked);

  async function fetchDevices() {
    try {
      const res = await listDevices();
      setDevices(res.devices);
    } catch (err) {
      console.error("Failed to fetch devices:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (pairingExpiry <= 0) return;
    const t = setInterval(() => {
      setPairingExpiry((p) => {
        if (p <= 1) {
          clearInterval(t);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [pairingExpiry > 0]);

  async function handleAddThisDevice() {
    if (!addName) return;
    setActionLoading(true);
    try {
      const fp = await getDeviceFingerprint();
      const res = await registerDevice({
        name: addName,
        device_type: toProtoDeviceType(guessDeviceType()),
        fingerprint: fp,
      });
      try { await ensureDeviceKeys(res.device.device_id); } catch {}
      await fetchDevices();
      setModal(null);
      setAddName("");
      toast.success("Device registered");
    } catch (err) {
      console.error("Failed to add device:", err);
      toast.error("Failed to add device");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleGeneratePairingCode() {
    const myDevice = devices.find((d) => d.is_approved);
    if (!myDevice) return;
    setActionLoading(true);
    try {
      const res = await generatePairingCode(myDevice.device_id);
      setPairingCode(res.pairing_code);
      setPairingExpiry(res.expires_in_s);
      setModal("pairing-generate");
    } catch (err) {
      console.error("Failed to generate pairing code:", err);
      toast.error("Failed to generate pairing code");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRedeemCode() {
    if (!redeemCode || !redeemName) return;
    setActionLoading(true);
    try {
      const fp = await getDeviceFingerprint();
      await redeemPairingCode({
        pairing_code: redeemCode,
        name: redeemName,
        device_type: toProtoDeviceType(guessDeviceType()),
        fingerprint: fp,
      });
      await fetchDevices();
      setModal(null);
      setRedeemCode("");
      setRedeemName("");
      toast.success("Pairing code redeemed");
    } catch (err) {
      console.error("Failed to redeem code:", err);
      toast.error("Failed to redeem pairing code");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApprove(pendingId: string, approve: boolean) {
    const myDevice = devices.find((d) => d.is_approved);
    if (!myDevice) return;
    try {
      await approvePairing({
        approver_device_id: myDevice.device_id,
        pending_device_id: pendingId,
        approve,
      });
      await fetchDevices();
    } catch (err) {
      console.error("Failed to approve/reject device:", err);
    }
  }

  async function handleRevoke(deviceId: string) {
    if (!confirm("Revoke this device? It will lose access to your account.")) return;
    try {
      await revokeDevice(deviceId);
      if (selected?.device_id === deviceId) setSelected(null);
      await fetchDevices();
    } catch (err) {
      console.error("Failed to revoke device:", err);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-medium text-gray-100">Devices</h1>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 glass-card-static animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-100">Devices</h1>
          <p className="text-xs text-gray-500 mt-1">Device inventory and pairing workflows</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModal("add-this")}
            className="px-3 py-1.5 rounded-md bg-emerald-500 text-gray-950 text-sm font-medium hover:bg-emerald-400 transition-colors"
          >
            Register This Device
          </button>
          <button
            onClick={handleGeneratePairingCode}
            className="px-3 py-1.5 rounded-md border border-gray-700/50 bg-transparent text-sm text-gray-300 hover:text-gray-100 hover:border-emerald-500/30 transition-colors"
          >
            Pairing Code
          </button>
          <button
            onClick={() => setModal("pairing-redeem")}
            className="px-3 py-1.5 rounded-md border border-gray-700/50 bg-transparent text-sm text-gray-300 hover:text-gray-100 hover:border-emerald-500/30 transition-colors"
          >
            Join With Code
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard label="Approved" value={activeDevices.length} hint="Trusted devices" />
        <MetricCard label="Pending" value={pendingDevices.length} hint="Waiting for approval" />
        <MetricCard label="Revoked" value={revokedDevices.length} hint="Access removed" />
      </div>

      <div className="glass-card-static p-4">
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Pairing Process</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ProcessStep title="1. Generate" description="Create one-time pairing code on an approved device." />
          <ProcessStep title="2. Redeem" description="Enter code from the new device and submit fingerprint." />
          <ProcessStep title="3. Approve" description="Review pending request and confirm trusted access." />
        </div>
      </div>

      {/* Pending approvals */}
      {pendingDevices.length > 0 && (
        <div className="rounded-xl border border-yellow-900/40 bg-yellow-950/20 p-4 space-y-3">
          <p className="text-xs text-yellow-500 uppercase tracking-wider">Pending Approval</p>
          {pendingDevices.map((d) => (
            <div key={d.device_id} className="flex items-center justify-between rounded-lg border border-yellow-900/20 bg-yellow-950/10 px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">{d.name}</span>
                <span className="text-xs text-gray-600">{typeLabel[normalizeDeviceType(d.device_type)]}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(d.device_id, true)}
                  className="px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs text-emerald-400 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApprove(d.device_id, false)}
                  className="px-3 py-1 rounded-md text-xs text-gray-500 hover:text-red-400 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-6">
        {/* Device list */}
        <div className="flex-1 space-y-2">
          {activeDevices.length === 0 ? (
            <div className="drop-zone p-10 text-center">
              <MonitorSmartphone className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400">No devices registered</p>
              <p className="text-xs text-gray-600 mt-1 mb-3">Add this device or pair a remote one to get started</p>
              <button
                onClick={() => setModal("add-this")}
                className="px-4 py-1.5 rounded-md bg-emerald-500 text-gray-950 text-xs font-medium hover:bg-emerald-400 transition-colors"
              >
                Register this device
              </button>
            </div>
          ) : (
            activeDevices.map((d) => (
              <button
                key={d.device_id}
                onClick={() => setSelected(selected?.device_id === d.device_id ? null : d)}
                className={`w-full text-left rounded-xl transition-all duration-200 hover:scale-[1.005] ${
                  selected?.device_id === d.device_id
                    ? "glass-card border-emerald-500/30"
                    : "glass-card"
                } px-4 py-3`}
                style={selected?.device_id === d.device_id ? { borderColor: "rgba(52, 211, 153, 0.3)" } : {}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DeviceIcon type={normalizeDeviceType(d.device_type)} className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-200">{d.name}</span>
                    <span className="text-xs text-gray-600">{typeLabel[normalizeDeviceType(d.device_type)]}</span>
                  </div>
                  <span className="text-xs text-gray-600">{timeAgo(d.last_active)}</span>
                </div>
                {d.node_id && (
                  <p className="text-xs text-gray-600 font-mono mt-1">{d.node_id}</p>
                )}
              </button>
            ))
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-72 shrink-0 glass-card-static p-5 space-y-5 self-start">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-200">{selected.name}</p>
              <button onClick={() => setSelected(null)} className="text-xs text-gray-600 hover:text-gray-400">
                Close
              </button>
            </div>

            <div className="space-y-3">
              <DetailRow label="Type" value={typeLabel[normalizeDeviceType(selected.device_type)]} />
              <DetailRow label="Status" value={selected.is_approved ? "Approved" : "Pending"} />
              <DetailRow label="Added" value={formatDate(selected.created_at)} />
              <DetailRow label="Last Active" value={timeAgo(selected.last_active)} />
              {selected.node_id && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Node ID</p>
                  <p className="text-xs text-gray-400 font-mono break-all">{selected.node_id}</p>
                </div>
              )}
              {selected.fingerprint && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fingerprint</p>
                  <p className="text-xs text-gray-400 font-mono break-all">{selected.fingerprint.slice(0, 24)}...</p>
                </div>
              )}
              {selected.approved_by_device_id && (
                <DetailRow label="Approved By" value={selected.approved_by_device_id.slice(0, 8) + "..."} />
              )}
            </div>

            <button
              onClick={() => handleRevoke(selected.device_id)}
              className="w-full px-3 py-1.5 rounded-md text-xs text-red-400 border border-red-900/30 hover:border-red-400/30 hover:bg-red-400/5 transition-colors"
            >
              Revoke Device
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setModal(null)}>
          <div className="glass-card-static p-6 w-full max-w-sm space-y-4 shadow-[0_20px_40px_rgba(0,0,0,0.45)]" onClick={(e) => e.stopPropagation()}>
            {modal === "add-this" && (
              <>
                <div>
                  <h2 className="text-base font-medium text-gray-100">Add This Device</h2>
                  <p className="text-xs text-gray-500 mt-1">Register the current browser as a device</p>
                </div>
                <input
                  type="text"
                  placeholder="Device name"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  autoFocus
                  className="w-full bg-gray-800/80 border border-gray-700/50 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                />
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Type: {typeLabel[guessDeviceType()]}</p>
                  <p>Fingerprint: {fpPreview.slice(0, 16)}...</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setModal(null)} className="px-3 py-1.5 rounded-md text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleAddThisDevice}
                    disabled={!addName || actionLoading}
                    className="px-4 py-1.5 rounded-md bg-emerald-500 text-gray-950 text-sm font-medium hover:bg-emerald-400 disabled:opacity-40 transition-colors"
                  >
                    {actionLoading ? "Adding..." : "Add"}
                  </button>
                </div>
              </>
            )}

            {modal === "pairing-generate" && (
              <>
                <div>
                  <h2 className="text-base font-medium text-gray-100">Pairing Code</h2>
                  <p className="text-xs text-gray-500 mt-1">Enter this code on the device you want to pair</p>
                </div>
                <div className="text-center py-6">
                  <p className="text-3xl font-mono font-medium tracking-[0.4em] text-emerald-400">{pairingCode}</p>
                </div>
                <div className="text-center">
                  {pairingExpiry > 0 ? (
                    <p className="text-xs text-gray-500">
                      Expires in {Math.floor(pairingExpiry / 60)}:{String(pairingExpiry % 60).padStart(2, "0")}
                    </p>
                  ) : (
                    <p className="text-xs text-red-400/80">Code expired</p>
                  )}
                </div>
                <button onClick={() => setModal(null)} className="w-full px-3 py-1.5 rounded-md border border-gray-700/50 bg-transparent text-sm text-gray-300 hover:text-gray-100 hover:border-emerald-500/30 transition-colors">
                  Close
                </button>
              </>
            )}

            {modal === "pairing-redeem" && (
              <>
                <div>
                  <h2 className="text-base font-medium text-gray-100">Enter Pairing Code</h2>
                  <p className="text-xs text-gray-500 mt-1">Enter the 6-character code from your other device</p>
                </div>
                <input
                  type="text"
                  placeholder="XXXXXX"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase().slice(0, 6))}
                  autoFocus
                  className="w-full bg-gray-800/80 border border-gray-700/50 rounded-md px-3 py-2 text-sm text-center font-mono text-lg tracking-[0.3em] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                  maxLength={6}
                />
                <input
                  type="text"
                  placeholder="Device name"
                  value={redeemName}
                  onChange={(e) => setRedeemName(e.target.value)}
                  className="w-full bg-gray-800/80 border border-gray-700/50 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setModal(null)} className="px-3 py-1.5 rounded-md text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleRedeemCode}
                    disabled={redeemCode.length !== 6 || !redeemName || actionLoading}
                    className="px-4 py-1.5 rounded-md bg-emerald-500 text-gray-950 text-sm font-medium hover:bg-emerald-400 disabled:opacity-40 transition-colors"
                  >
                    {actionLoading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300">{value}</span>
    </div>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="glass-card-static px-4 py-3">
      <p className="text-4xl font-bold text-gray-50">{value}</p>
      <p className="text-xs uppercase tracking-wider text-gray-500 mt-1">{label}</p>
      <p className="text-xs text-gray-600 mt-1">{hint}</p>
    </div>
  );
}

function ProcessStep({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3">
      <p className="text-sm text-gray-200">{title}</p>
      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{description}</p>
    </div>
  );
}

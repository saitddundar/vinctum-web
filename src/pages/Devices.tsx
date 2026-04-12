import { useEffect, useState } from "react";
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

const typeBadge = {
  pc: "bg-blue-900/50 text-blue-300 border-blue-800",
  phone: "bg-purple-900/50 text-purple-300 border-purple-800",
  tablet: "bg-teal-900/50 text-teal-300 border-teal-800",
};

const typeIcon = {
  pc: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z",
  phone: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  tablet: "M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25V4.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z",
};

function timeAgo(iso: string) {
  if (!iso) return "never";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type ModalMode = null | "add-this" | "pairing-generate" | "pairing-redeem";

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
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

  // Countdown for pairing code
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
      await registerDevice({
        name: addName,
        device_type: toProtoDeviceType(guessDeviceType()),
        fingerprint: fp,
      });
      await fetchDevices();
      setModal(null);
      setAddName("");
    } catch (err) {
      console.error("Failed to add device:", err);
      alert("Failed to add device. Is the backend running?");
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
      alert("Failed to generate pairing code.");
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
    } catch (err) {
      console.error("Failed to redeem code:", err);
      alert("Failed to redeem pairing code.");
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
    try {
      await revokeDevice(deviceId);
      await fetchDevices();
    } catch (err) {
      console.error("Failed to revoke device:", err);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Devices</h1>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-900 border border-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Devices</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setModal("add-this")}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors"
          >
            Add This Device
          </button>
          <button
            onClick={handleGeneratePairingCode}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium transition-colors border border-gray-700"
          >
            Remote Pairing
          </button>
          <button
            onClick={() => setModal("pairing-redeem")}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium transition-colors border border-gray-700"
          >
            Enter Code
          </button>
        </div>
      </div>

      {/* Pending approvals banner */}
      {pendingDevices.length > 0 && (
        <div className="rounded-lg border border-yellow-800 bg-yellow-900/30 p-4 space-y-3">
          <p className="text-sm font-medium text-yellow-300">Pending Approval</p>
          {pendingDevices.map((d) => (
            <div key={d.device_id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={typeIcon[normalizeDeviceType(d.device_type)]} />
                </svg>
                <span className="text-sm text-gray-200">{d.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded border ${typeBadge[normalizeDeviceType(d.device_type)]}`}>{normalizeDeviceType(d.device_type)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(d.device_id, true)}
                  className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-medium transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApprove(d.device_id, false)}
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-xs font-medium transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Device list */}
      <div className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs">
              <th className="text-left px-4 py-3 font-medium">Device</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Last Active</th>
              <th className="text-right px-4 py-3 font-medium">Added</th>
              <th className="text-right px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {devices.filter((d) => !d.is_revoked).map((d) => (
              <tr key={d.device_id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={typeIcon[normalizeDeviceType(d.device_type)]} />
                    </svg>
                    <span className="text-gray-200">{d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded border ${typeBadge[normalizeDeviceType(d.device_type)]}`}>{normalizeDeviceType(d.device_type)}</span>
                </td>
                <td className="px-4 py-3">
                  {d.is_approved ? (
                    <span className="text-xs px-2 py-0.5 rounded border bg-emerald-900/50 text-emerald-300 border-emerald-800">approved</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded border bg-yellow-900/50 text-yellow-300 border-yellow-800">pending</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-gray-500 text-xs">{timeAgo(d.last_active)}</td>
                <td className="px-4 py-3 text-right text-gray-500 text-xs">{timeAgo(d.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleRevoke(d.device_id)}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setModal(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            {modal === "add-this" && (
              <>
                <h2 className="text-lg font-medium">Add This Device</h2>
                <input
                  type="text"
                  placeholder="Device name (e.g. My Laptop)"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">
                  Type: {guessDeviceType()} | Fingerprint: {fpPreview.slice(0, 12)}...
                </p>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleAddThisDevice}
                    disabled={!addName || actionLoading}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? "Adding..." : "Add Device"}
                  </button>
                </div>
              </>
            )}

            {modal === "pairing-generate" && (
              <>
                <h2 className="text-lg font-medium">Pairing Code</h2>
                <p className="text-sm text-gray-400">Enter this code on the new device</p>
                <div className="text-center py-4">
                  <p className="text-4xl font-mono font-bold tracking-[0.3em] text-white">{pairingCode}</p>
                </div>
                <div className="text-center">
                  {pairingExpiry > 0 ? (
                    <p className="text-xs text-gray-500">
                      Expires in {Math.floor(pairingExpiry / 60)}:{String(pairingExpiry % 60).padStart(2, "0")}
                    </p>
                  ) : (
                    <p className="text-xs text-red-400">Code expired</p>
                  )}
                </div>
                <button onClick={() => setModal(null)} className="w-full px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors">
                  Close
                </button>
              </>
            )}

            {modal === "pairing-redeem" && (
              <>
                <h2 className="text-lg font-medium">Enter Pairing Code</h2>
                <input
                  type="text"
                  placeholder="6-character code"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase().slice(0, 6))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-center font-mono text-lg tracking-[0.2em] focus:outline-none focus:border-blue-500"
                  maxLength={6}
                />
                <input
                  type="text"
                  placeholder="Device name"
                  value={redeemName}
                  onChange={(e) => setRedeemName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleRedeemCode}
                    disabled={redeemCode.length !== 6 || !redeemName || actionLoading}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium disabled:opacity-50 transition-colors"
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

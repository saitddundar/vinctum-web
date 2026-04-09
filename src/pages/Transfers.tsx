import { useEffect, useState, useCallback } from "react";
import type { Device } from "../types/device";
import type { TransferInfo, TransferStatus } from "../types/transfer";
import { listDevices } from "../lib/device-api";
import { initiateTransfer, listTransfers, cancelTransfer, getTransferStatus } from "../lib/transfer-api";

const statusConfig: Record<TransferStatus, { label: string; color: string; dot: string }> = {
  TRANSFER_STATUS_UNSPECIFIED: { label: "Unknown", color: "text-gray-400", dot: "bg-gray-400" },
  TRANSFER_STATUS_PENDING: { label: "Pending", color: "text-yellow-300", dot: "bg-yellow-400" },
  TRANSFER_STATUS_IN_PROGRESS: { label: "Transferring", color: "text-blue-300", dot: "bg-blue-400" },
  TRANSFER_STATUS_COMPLETED: { label: "Completed", color: "text-emerald-300", dot: "bg-emerald-400" },
  TRANSFER_STATUS_FAILED: { label: "Failed", color: "text-red-300", dot: "bg-red-400" },
  TRANSFER_STATUS_CANCELLED: { label: "Cancelled", color: "text-gray-400", dot: "bg-gray-500" },
};

const statusBadge: Record<TransferStatus, string> = {
  TRANSFER_STATUS_UNSPECIFIED: "bg-gray-900/50 text-gray-300 border-gray-700",
  TRANSFER_STATUS_PENDING: "bg-yellow-900/50 text-yellow-300 border-yellow-800",
  TRANSFER_STATUS_IN_PROGRESS: "bg-blue-900/50 text-blue-300 border-blue-800",
  TRANSFER_STATUS_COMPLETED: "bg-emerald-900/50 text-emerald-300 border-emerald-800",
  TRANSFER_STATUS_FAILED: "bg-red-900/50 text-red-300 border-red-800",
  TRANSFER_STATUS_CANCELLED: "bg-gray-900/50 text-gray-400 border-gray-700",
};

type FilterStatus = "all" | "active" | "completed" | "failed";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function timeAgo(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function isActive(s: TransferStatus) {
  return s === "TRANSFER_STATUS_PENDING" || s === "TRANSFER_STATUS_IN_PROGRESS";
}

export default function Transfers() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [transfers, setTransfers] = useState<TransferInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [showSend, setShowSend] = useState(false);
  const [error, setError] = useState("");

  // Send form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetDevice, setTargetDevice] = useState("");
  const [sending, setSending] = useState(false);

  const myDevice = devices.find((d) => d.is_approved && !d.is_revoked);

  const fetchData = useCallback(async () => {
    try {
      const devRes = await listDevices();
      const approved = devRes.devices.filter((d) => d.is_approved && !d.is_revoked);
      setDevices(approved);

      if (approved.length > 0 && approved[0].node_id) {
        const txRes = await listTransfers(approved[0].node_id);
        setTransfers(txRes.transfers || []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll active transfers for progress
  useEffect(() => {
    const activeIds = transfers.filter((t) => isActive(t.status)).map((t) => t.transfer_id);
    if (activeIds.length === 0) return;

    const interval = setInterval(async () => {
      const updates = await Promise.allSettled(
        activeIds.map((id) => getTransferStatus(id))
      );

      setTransfers((prev) =>
        prev.map((t) => {
          const idx = activeIds.indexOf(t.transfer_id);
          if (idx === -1) return t;
          const result = updates[idx];
          if (result.status !== "fulfilled") return t;
          const status = result.value;
          return {
            ...t,
            status: status.status,
            progress_percent: status.total_chunks > 0
              ? Math.round((status.chunks_transferred / status.total_chunks) * 100)
              : t.progress_percent,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [transfers.map((t) => t.transfer_id + t.status).join(",")]);

  async function handleSend() {
    if (!selectedFile || !targetDevice || !myDevice?.node_id) return;
    setSending(true);
    setError("");

    try {
      // Generate content hash from file
      const buffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const contentHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      // Generate E2E encryption key
      const key = crypto.getRandomValues(new Uint8Array(32));
      const encryptionKey = btoa(String.fromCharCode(...key));

      const target = devices.find((d) => d.device_id === targetDevice);

      await initiateTransfer({
        sender_node_id: myDevice.node_id,
        receiver_node_id: target?.node_id || "",
        filename: selectedFile.name,
        total_size_bytes: selectedFile.size,
        content_hash: contentHash,
        encryption_key: encryptionKey,
        chunk_size_bytes: 262144, // 256KB
      });

      setShowSend(false);
      setSelectedFile(null);
      setTargetDevice("");
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to initiate transfer");
    } finally {
      setSending(false);
    }
  }

  async function handleCancel(transferId: string) {
    try {
      await cancelTransfer(transferId, "Cancelled by user");
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to cancel transfer");
    }
  }

  const filtered = transfers.filter((t) => {
    if (filter === "all") return true;
    if (filter === "active") return isActive(t.status);
    if (filter === "completed") return t.status === "TRANSFER_STATUS_COMPLETED";
    if (filter === "failed") return t.status === "TRANSFER_STATUS_FAILED" || t.status === "TRANSFER_STATUS_CANCELLED";
    return true;
  });

  const counts = {
    all: transfers.length,
    active: transfers.filter((t) => isActive(t.status)).length,
    completed: transfers.filter((t) => t.status === "TRANSFER_STATUS_COMPLETED").length,
    failed: transfers.filter((t) => t.status === "TRANSFER_STATUS_FAILED" || t.status === "TRANSFER_STATUS_CANCELLED").length,
  };

  const otherDevices = devices.filter((d) => d.device_id !== myDevice?.device_id);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">File Sharing</h1>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-900 border border-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">File Sharing</h1>
        <div className="flex gap-2">
          {myDevice?.node_id ? (
            <button
              onClick={() => setShowSend(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Send File
            </button>
          ) : (
            <div className="px-4 py-2 rounded-lg bg-gray-800 text-sm text-gray-500 border border-gray-700">
              Register device with a node to share files
            </div>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-300 text-xs">Dismiss</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard label="Total" count={counts.all} color="text-white" dot="bg-gray-400" />
        <StatsCard label="Active" count={counts.active} color="text-blue-400" dot="bg-blue-400" />
        <StatsCard label="Completed" count={counts.completed} color="text-emerald-400" dot="bg-emerald-400" />
        <StatsCard label="Failed" count={counts.failed} color="text-red-400" dot="bg-red-400" />
      </div>

      {/* Filters */}
      <div className="flex gap-1">
        {(["all", "active", "completed", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              filter === f ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="text-gray-600 ml-0.5">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* No devices warning */}
      {devices.length === 0 && (
        <div className="rounded-lg border border-yellow-800 bg-yellow-900/20 p-6 text-center">
          <p className="text-sm text-yellow-300">No approved devices found</p>
          <p className="text-xs text-gray-500 mt-1">Register a device first to start sharing files</p>
        </div>
      )}

      {/* Transfer list */}
      {filtered.length > 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs">
                <th className="text-left px-4 py-3 font-medium">File</th>
                <th className="text-left px-4 py-3 font-medium">Direction</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Progress</th>
                <th className="text-right px-4 py-3 font-medium">Size</th>
                <th className="text-right px-4 py-3 font-medium">Time</th>
                <th className="text-right px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const isSender = t.sender_node_id === myDevice?.node_id;
                const cfg = statusConfig[t.status] || statusConfig.TRANSFER_STATUS_UNSPECIFIED;
                const badge = statusBadge[t.status] || statusBadge.TRANSFER_STATUS_UNSPECIFIED;

                return (
                  <tr key={t.transfer_id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-200 truncate max-w-[200px]">{t.filename}</p>
                          <p className="text-xs text-gray-600 font-mono truncate">{t.transfer_id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isSender ? (
                          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                        )}
                        <span className="text-xs text-gray-400">{isSender ? "Sent" : "Received"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded border ${badge}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 w-40">
                      {isActive(t.status) ? (
                        <div className="space-y-1">
                          <div className="w-full bg-gray-800 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                              style={{ width: `${t.progress_percent}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 text-right">{t.progress_percent}%</p>
                        </div>
                      ) : t.status === "TRANSFER_STATUS_COMPLETED" ? (
                        <span className="text-xs text-emerald-400">100%</span>
                      ) : (
                        <span className="text-xs text-gray-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 text-xs">
                      {formatBytes(t.total_size_bytes)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">
                      {timeAgo(t.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isActive(t.status) && (
                        <button
                          onClick={() => handleCancel(t.transfer_id)}
                          className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        devices.length > 0 && (
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
            <svg className="w-12 h-12 text-gray-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
            </svg>
            <p className="text-gray-500">No transfers yet</p>
            <p className="text-xs text-gray-600 mt-1">Send a file to another device to get started</p>
          </div>
        )
      )}

      {/* Send File Modal */}
      {showSend && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowSend(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md space-y-5" onClick={(e) => e.stopPropagation()}>
            <div>
              <h2 className="text-lg font-medium">Send File</h2>
              <p className="text-sm text-gray-500 mt-1">Choose a file and target device</p>
            </div>

            {/* File picker */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">File</label>
              {selectedFile ? (
                <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                  <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatBytes(selectedFile.size)}</p>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="text-xs text-gray-500 hover:text-gray-300">
                    Change
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 bg-gray-800/50 border border-dashed border-gray-700 rounded-lg px-4 py-6 cursor-pointer hover:border-blue-600 hover:bg-gray-800 transition-colors">
                  <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  <span className="text-sm text-gray-400">Click to select file</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </label>
              )}
            </div>

            {/* Target device */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Send to</label>
              {otherDevices.length > 0 ? (
                <div className="space-y-2">
                  {otherDevices.map((d) => (
                    <label
                      key={d.device_id}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                        targetDevice === d.device_id
                          ? "border-blue-600 bg-blue-900/20"
                          : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="target-device"
                        value={d.device_id}
                        checked={targetDevice === d.device_id}
                        onChange={(e) => setTargetDevice(e.target.value)}
                        className="sr-only"
                      />
                      <DeviceIcon type={d.device_type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200">{d.name}</p>
                        <p className="text-xs text-gray-500">{d.device_type} {d.node_id ? `| ${d.node_id.slice(0, 12)}...` : "| no node"}</p>
                      </div>
                      {targetDevice === d.device_id && (
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500">No other devices available</p>
                  <p className="text-xs text-gray-600 mt-1">Pair another device first</p>
                </div>
              )}
            </div>

            {/* E2E notice */}
            <div className="flex items-start gap-2 bg-emerald-900/20 border border-emerald-800/50 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <p className="text-xs text-emerald-300">End-to-end encrypted with AES-256-GCM. Only you and the recipient can decrypt.</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => setShowSend(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!selectedFile || !targetDevice || sending}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Encrypting...
                  </>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsCard({ label, count, color, dot }: { label: string; count: number; color: string; dot: string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className={`text-xl font-semibold ${color}`}>{count}</p>
    </div>
  );
}

function DeviceIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    pc: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z",
    phone: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
    tablet: "M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25V4.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z",
  };
  return (
    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[type] || icons.pc} />
    </svg>
  );
}

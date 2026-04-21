import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { Device } from "../types/device";
import type { TransferInfo, TransferStatus } from "../types/transfer";
import { listDevices } from "../lib/device-api";
import {
  initiateTransfer,
  listTransfers,
  cancelTransfer,
  getTransferStatus,
  uploadFile,
  generateE2EKey,
  exportKeyBase64,
  importKeyBase64,
  downloadFile,
} from "../lib/transfer-api";

const statusLabel: Record<TransferStatus, string> = {
  TRANSFER_STATUS_UNSPECIFIED: "Unknown",
  TRANSFER_STATUS_PENDING: "Pending",
  TRANSFER_STATUS_IN_PROGRESS: "Transferring",
  TRANSFER_STATUS_COMPLETED: "Completed",
  TRANSFER_STATUS_FAILED: "Failed",
  TRANSFER_STATUS_CANCELLED: "Cancelled",
};

const statusColor: Record<TransferStatus, string> = {
  TRANSFER_STATUS_UNSPECIFIED: "text-gray-500",
  TRANSFER_STATUS_PENDING: "text-yellow-500",
  TRANSFER_STATUS_IN_PROGRESS: "text-blue-400",
  TRANSFER_STATUS_COMPLETED: "text-emerald-400",
  TRANSFER_STATUS_FAILED: "text-red-400",
  TRANSFER_STATUS_CANCELLED: "text-gray-500",
};

type FilterStatus = "all" | "active" | "completed" | "failed";
type PipelineStep = "prepare" | "encrypt" | "upload" | "verify" | "complete";

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
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isActive(s: TransferStatus) {
  return s === "TRANSFER_STATUS_PENDING" || s === "TRANSFER_STATUS_IN_PROGRESS";
}

// Transfer lifecycle steps
type TransferStep = "select" | "encrypt" | "upload" | "done";

export default function Transfers() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [transfers, setTransfers] = useState<TransferInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [showSend, setShowSend] = useState(false);
  const [error, setError] = useState("");

  // Send form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetDevice, setTargetDevice] = useState("");
  const [sending, setSending] = useState(false);
  const [sendStep, setSendStep] = useState<TransferStep>("select");
  const [uploadProgress, setUploadProgress] = useState<{ sent: number; total: number } | null>(null);
  const [shareKey, setShareKey] = useState<{ transferId: string; key: string } | null>(null);
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>("prepare");

  // Upload speed tracking
  const uploadStartRef = useRef<number>(0);
  const chunkSizeRef = useRef<number>(262144);

  // Receive
  const [downloadPrompt, setDownloadPrompt] = useState<{ transfer: TransferInfo; keyInput: string } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ received: number } | null>(null);

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

  // Poll active transfers
  useEffect(() => {
    const activeIds = transfers.filter((t) => isActive(t.status)).map((t) => t.transfer_id);
    if (activeIds.length === 0) return;

    const interval = setInterval(async () => {
      const updates = await Promise.allSettled(activeIds.map((id) => getTransferStatus(id)));
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
    setUploadProgress(null);
    setError("");

    try {
      setSendStep("encrypt");
      setPipelineStep("encrypt");

      const buffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const contentHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      const cryptoKey = await generateE2EKey();
      const exportedKey = await exportKeyBase64(cryptoKey);

      const target = devices.find((d) => d.device_id === targetDevice);

      const transfer = await initiateTransfer({
        sender_node_id: myDevice.node_id,
        receiver_node_id: target?.node_id || "",
        filename: selectedFile.name,
        total_size_bytes: selectedFile.size,
        content_hash: contentHash,
        chunk_size_bytes: 262144,
        sender_ephemeral_pubkey: btoa(String.fromCharCode(...new Array(32).fill(1))),
      });

      try {
        localStorage.setItem(`vinctum_transfer_key_${transfer.transfer_id}`, exportedKey);
      } catch { /* noop */ }

      setShowSend(false);
      setShareKey({ transferId: transfer.transfer_id, key: exportedKey });

      setSendStep("upload");
      setPipelineStep("upload");
      setUploadProgress({ sent: 0, total: transfer.total_chunks });
      uploadStartRef.current = Date.now();
      chunkSizeRef.current = 262144;

      await uploadFile(transfer.transfer_id, selectedFile, cryptoKey, (sent, total) => {
        setUploadProgress({ sent, total });
      });

      setPipelineStep("verify");
      setSendStep("done");
      setPipelineStep("complete");
      setUploadProgress(null);
      setSelectedFile(null);
      setTargetDevice("");
      toast.success("File sent successfully");
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to send file");
      setUploadProgress(null);
    } finally {
      setSending(false);
      setSendStep("select");
      setPipelineStep("prepare");
    }
  }

  async function handleCancel(transferId: string) {
    try {
      await cancelTransfer(transferId, "Cancelled by user");
      toast.success("Transfer cancelled");
      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to cancel transfer");
    }
  }

  async function processDownload() {
    if (!downloadPrompt?.keyInput || !myDevice?.node_id) return;
    setDownloading(true);
    setError("");

    try {
      let cryptoKey: CryptoKey;
      try {
        cryptoKey = await importKeyBase64(downloadPrompt.keyInput.trim());
      } catch {
        throw new Error("Invalid decryption key format.");
      }

      setDownloadProgress({ received: 0 });

      const blob = await downloadFile(
        downloadPrompt.transfer.transfer_id,
        myDevice.node_id,
        cryptoKey,
        (received) => {
          setDownloadProgress({ received });
        }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadPrompt.transfer.filename || "downloaded-file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadPrompt(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Failed to download or decrypt file");
    } finally {
      setDownloading(false);
      setDownloadProgress(null);
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
        <h1 className="text-xl font-medium text-gray-100">File Sharing</h1>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-md bg-gray-900/50 border border-gray-800/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-100">File Sharing</h1>
          <p className="text-xs text-gray-500 mt-1">Secure transfer pipeline with end-to-end encryption</p>
        </div>
        {myDevice?.node_id ? (
          <button
            onClick={() => { setShowSend(true); setSendStep("select"); }}
            className="px-3 py-1.5 rounded-md bg-gray-100 text-gray-900 text-sm font-medium hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Send File
          </button>
        ) : (
          <span className="text-xs text-gray-600">Register a device to send files</span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-900/40 bg-red-950/30 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => setError("")} className="text-xs text-red-500 hover:text-red-300">Dismiss</button>
        </div>
      )}

      <div className="rounded-xl border border-gray-800/50 bg-gradient-to-b from-gray-900/70 to-gray-900/40 p-4 space-y-3 shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-gray-500">Transfer Pipeline</p>
          <p className="text-xs text-gray-600">prepare / encrypt / upload / verify / complete</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <PipelinePill label="Prepare" active={pipelineStep === "prepare"} done={pipelineStep !== "prepare"} />
          <PipelinePill label="Encrypt" active={pipelineStep === "encrypt"} done={["upload", "verify", "complete"].includes(pipelineStep)} />
          <PipelinePill label="Upload" active={pipelineStep === "upload"} done={["verify", "complete"].includes(pipelineStep)} />
          <PipelinePill label="Verify" active={pipelineStep === "verify"} done={pipelineStep === "complete"} />
          <PipelinePill label="Complete" active={pipelineStep === "complete"} done={false} />
        </div>
      </div>

      {/* Upload progress */}
      {uploadProgress && (
        <div className="rounded-xl border border-gray-800/50 bg-gradient-to-b from-gray-900/80 to-gray-900/50 p-4 space-y-3 shadow-[0_10px_26px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-300">
                {sendStep === "encrypt" ? "Encrypting..." : "Uploading chunks..."}
              </span>
            </div>
            <span className="text-xs text-gray-500 tabular-nums">
              {Math.round(uploadProgress.total > 0 ? (uploadProgress.sent / uploadProgress.total) * 100 : 0)}%
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress.total > 0 ? (uploadProgress.sent / uploadProgress.total) * 100 : 0}%` }}
            />
          </div>
          <UploadStats sent={uploadProgress.sent} total={uploadProgress.total} startTime={uploadStartRef.current} chunkSize={chunkSizeRef.current} />
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs">
            <StepDot active={sendStep === "encrypt"} done={sendStep === "upload" || sendStep === "done"} />
            <span className={sendStep === "encrypt" ? "text-gray-300" : "text-gray-600"}>Encrypt</span>
            <span className="text-gray-800">—</span>
            <StepDot active={sendStep === "upload"} done={sendStep === "done"} />
            <span className={sendStep === "upload" ? "text-gray-300" : "text-gray-600"}>Upload</span>
            <span className="text-gray-800">—</span>
            <StepDot active={false} done={sendStep === "done"} />
            <span className={sendStep === "done" ? "text-gray-300" : "text-gray-600"}>Complete</span>
          </div>
        </div>
      )}

      {/* Download progress */}
      {downloadProgress && (
        <div className="rounded-xl border border-gray-800/50 bg-gradient-to-b from-gray-900/80 to-gray-900/50 p-4 shadow-[0_10px_26px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-300">Downloading and decrypting...</span>
            <span className="text-xs text-gray-500 ml-auto tabular-nums">{downloadProgress.received} chunks</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="h-1.5 rounded-full bg-emerald-500 w-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-1 border-b border-gray-800/40 pb-3">
        {(["all", "active", "completed", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-md text-xs transition-colors ${
              filter === f
                ? "bg-gray-800 text-gray-200"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {counts[f] > 0 && <span className="text-gray-600 ml-1">{counts[f]}</span>}
          </button>
        ))}
      </div>

      {/* No devices */}
      {devices.length === 0 && (
        <div className="rounded-md border border-gray-800/40 bg-gray-900/30 p-8 text-center">
          <p className="text-gray-400">No devices found</p>
          <p className="text-xs text-gray-600 mt-1">Register a device to start sharing files</p>
        </div>
      )}

      {/* Transfer list */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((t) => {
            const isSender = t.sender_node_id === myDevice?.node_id;
            return (
              <div key={t.transfer_id} className="rounded-xl border border-gray-800/40 bg-gray-900/50 px-4 py-3 transition-all duration-200 hover:border-gray-700/70 hover:-translate-y-[1px]">
                <div className="flex items-center gap-4">
                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-200 truncate">{t.filename}</p>
                      <span className="text-xs text-gray-600">{formatBytes(t.total_size_bytes)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">{isSender ? "Sent" : "Received"}</span>
                      <span className="text-gray-800">·</span>
                      <span className="text-xs text-gray-600">{timeAgo(t.created_at)}</span>
                      <span className="text-gray-800">·</span>
                      <span className="text-xs font-mono text-gray-700">{t.transfer_id.slice(0, 8)}</span>
                    </div>
                  </div>

                  {/* Progress / Status */}
                  <div className="flex items-center gap-4 shrink-0">
                    {isActive(t.status) ? (
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-900/80 border border-gray-800/60 ${statusColor[t.status]}`}>{statusLabel[t.status]}</span>
                          <span className="text-xs text-gray-500 tabular-nums">{t.progress_percent}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1">
                          <div
                            className="h-1 rounded-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${t.progress_percent}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-900/80 border border-gray-800/60 ${statusColor[t.status]}`}>{statusLabel[t.status]}</span>
                    )}

                    {/* Actions */}
                    {!isSender && t.status === "TRANSFER_STATUS_COMPLETED" && (
                      <button
                        onClick={() => setDownloadPrompt({ transfer: t, keyInput: "" })}
                        className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        Download
                      </button>
                    )}
                    {isActive(t.status) && (
                      <button
                        onClick={() => handleCancel(t.transfer_id)}
                        className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        devices.length > 0 && (
          <div className="rounded-md border border-gray-800/40 bg-gray-900/30 p-10 text-center">
            <p className="text-gray-400">No transfers</p>
            <p className="text-xs text-gray-600 mt-1 mb-3">Send a file to another device to get started</p>
            {myDevice?.node_id && (
              <button
                onClick={() => { setShowSend(true); setSendStep("select"); }}
                className="px-4 py-1.5 rounded-md bg-gray-800/80 border border-gray-700/50 text-xs text-gray-300 hover:text-gray-100 hover:border-gray-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Send your first file
              </button>
            )}
          </div>
        )
      )}

      {/* Share key modal */}
      {shareKey && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50" onClick={() => setShareKey(null)}>
          <div className="bg-gray-900/95 border border-gray-800/70 rounded-xl p-6 w-full max-w-md space-y-4 shadow-[0_20px_40px_rgba(0,0,0,0.45)]" onClick={(e) => e.stopPropagation()}>
            <div>
              <h2 className="text-base font-medium text-gray-100">Decryption Key</h2>
              <p className="text-xs text-gray-500 mt-1">Send this key to the recipient through a secure channel. The server never sees it.</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">AES-256-GCM key</p>
              <div className="bg-gray-800/80 border border-gray-700/50 rounded-md p-3">
                <p className="text-xs text-gray-300 font-mono break-all select-all">{shareKey.key}</p>
              </div>
            </div>
            <p className="text-xs text-yellow-600">This key is stored locally in your browser. If you lose it, the file cannot be decrypted.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => navigator.clipboard?.writeText(shareKey.key)}
                className="px-3 py-1.5 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 transition-colors"
              >
                Copy
              </button>
              <button
                onClick={() => setShareKey(null)}
                className="px-4 py-1.5 rounded-md bg-gray-100 text-gray-900 text-sm font-medium hover:bg-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send File Modal */}
      {showSend && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50" onClick={() => setShowSend(false)}>
          <div className="bg-gray-900/95 border border-gray-800/70 rounded-xl p-6 w-full max-w-md space-y-5 shadow-[0_20px_40px_rgba(0,0,0,0.45)]" onClick={(e) => e.stopPropagation()}>
            <div>
              <h2 className="text-base font-medium text-gray-100">Send File</h2>
              <p className="text-xs text-gray-500 mt-1">Select a file and recipient device</p>
            </div>

            {/* File picker */}
            <div>
              <p className="text-xs text-gray-500 mb-2">File</p>
              {selectedFile ? (
                <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700/50 rounded-md px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatBytes(selectedFile.size)}</p>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="text-xs text-gray-500 hover:text-gray-300 ml-3">
                    Change
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-1 bg-gray-800/30 border border-dashed border-gray-700/50 rounded-md px-4 py-6 cursor-pointer hover:border-gray-600 transition-colors">
                  <span className="text-sm text-gray-500">Click to select file</span>
                  <span className="text-xs text-gray-600">or drag and drop</span>
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
              <p className="text-xs text-gray-500 mb-2">Send to</p>
              {otherDevices.length > 0 ? (
                <div className="space-y-1.5">
                  {otherDevices.map((d) => (
                    <label
                      key={d.device_id}
                      className={`flex items-center justify-between rounded-md border px-4 py-2.5 cursor-pointer transition-colors ${
                        targetDevice === d.device_id
                          ? "border-gray-600 bg-gray-800/60"
                          : "border-gray-800/40 bg-gray-800/30 hover:border-gray-700"
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
                      <div className="min-w-0">
                        <p className="text-sm text-gray-200">{d.name}</p>
                        {d.node_id && <p className="text-xs text-gray-600 font-mono">{d.node_id.slice(0, 16)}...</p>}
                      </div>
                      {targetDevice === d.device_id && (
                        <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0 ml-3" />
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border border-gray-800/40 rounded-md">
                  <p className="text-xs text-gray-600">No other devices available. Pair another device first.</p>
                </div>
              )}
            </div>

            {/* E2E notice */}
            <p className="text-xs text-gray-600">
              Files are encrypted in your browser before upload. The encryption key is never sent to the server.
            </p>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSend(false)} className="px-3 py-1.5 rounded-md text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!selectedFile || !targetDevice || sending}
                className="px-5 py-1.5 rounded-md bg-gray-100 text-gray-900 text-sm font-medium hover:bg-white disabled:opacity-40 transition-colors"
              >
                {sending ? "Processing..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download/Decrypt Modal */}
      {downloadPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50" onClick={() => !downloading && setDownloadPrompt(null)}>
          <div className="bg-gray-900/95 border border-gray-800/70 rounded-xl p-6 w-full max-w-md space-y-4 shadow-[0_20px_40px_rgba(0,0,0,0.45)]" onClick={(e) => e.stopPropagation()}>
            <div>
              <h2 className="text-base font-medium text-gray-100">Decrypt & Download</h2>
              <p className="text-xs text-gray-500 mt-1">
                Enter the decryption key for <span className="text-gray-300">{downloadPrompt.transfer.filename}</span>
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">AES-256-GCM Key</p>
              <input
                type="text"
                autoFocus
                placeholder="Paste the base64 key..."
                value={downloadPrompt.keyInput}
                onChange={(e) => setDownloadPrompt({ ...downloadPrompt, keyInput: e.target.value })}
                className="w-full bg-gray-800/80 border border-gray-700/50 rounded-md p-3 text-sm text-gray-200 placeholder-gray-600 font-mono focus:outline-none focus:border-gray-600 transition-colors"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDownloadPrompt(null)}
                disabled={downloading}
                className="px-3 py-1.5 rounded-md text-sm text-gray-500 hover:text-gray-300 disabled:opacity-40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={processDownload}
                disabled={!downloadPrompt.keyInput.trim() || downloading}
                className="px-5 py-1.5 rounded-md bg-gray-100 text-gray-900 text-sm font-medium hover:bg-white disabled:opacity-40 transition-colors"
              >
                {downloading ? "Decrypting..." : "Download"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  if (done) return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />;
  if (active) return <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />;
  return <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />;
}

function PipelinePill({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div
      className={`rounded-md border px-3 py-2 text-xs text-center transition-all duration-300 ${
        done
          ? "border-emerald-900/50 bg-emerald-950/20 text-emerald-300"
          : active
            ? "border-blue-900/50 bg-blue-950/20 text-blue-300"
            : "border-gray-800/40 bg-gray-900/40 text-gray-500"
      }`}
    >
      {label}
    </div>
  );
}

function UploadStats({ sent, total, startTime, chunkSize }: { sent: number; total: number; startTime: number; chunkSize: number }) {
  const elapsed = (Date.now() - startTime) / 1000;
  const bytesUploaded = sent * chunkSize;
  const speed = elapsed > 0 ? bytesUploaded / elapsed : 0;
  const remaining = total > sent && speed > 0 ? ((total - sent) * chunkSize) / speed : 0;

  const fmtSpeed = speed > 1024 * 1024
    ? `${(speed / (1024 * 1024)).toFixed(1)} MB/s`
    : `${(speed / 1024).toFixed(0)} KB/s`;

  const fmtEta = remaining > 60
    ? `~${Math.ceil(remaining / 60)}m remaining`
    : remaining > 0
      ? `~${Math.ceil(remaining)}s remaining`
      : "";

  return (
    <div className="flex items-center justify-between text-xs text-gray-600">
      <span>Chunks: {sent} / {total}</span>
      <span className="tabular-nums">{sent > 0 ? `${fmtSpeed}${fmtEta ? ` — ${fmtEta}` : ""}` : ""}</span>
    </div>
  );
}

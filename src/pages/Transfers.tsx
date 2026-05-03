import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { FileUp, Check, Upload, Lock, ShieldCheck, CircleDot, Users } from "lucide-react";
import type { Device } from "../types/device";
import type { TransferInfo, TransferStatus } from "../types/transfer";
import type { Friend } from "../types/friend";
import { listDevices } from "../lib/device-api";
import { listFriends, getFriendDevices } from "../lib/friend-api";
import {
  initiateTransfer,
  listTransfers,
  cancelTransfer,
  getTransferStatus,
  uploadFile,
  downloadFile,
} from "../lib/transfer-api";
import {
  ensureDeviceKeys,
  getRemoteDeviceKey,
  getRemoteDeviceKeyByNodeId,
  generateEphemeralKeyPair,
  deriveTransferKey,
  deriveReceiverKey,
} from "../lib/device-key";

const statusLabel: Record<TransferStatus, string> = {
  TRANSFER_STATUS_UNSPECIFIED: "Unknown",
  TRANSFER_STATUS_PENDING: "Pending",
  TRANSFER_STATUS_IN_PROGRESS: "Transferring",
  TRANSFER_STATUS_COMPLETED: "Completed",
  TRANSFER_STATUS_FAILED: "Failed",
  TRANSFER_STATUS_CANCELLED: "Cancelled",
  TRANSFER_STATUS_AWAITING_APPROVAL: "Awaiting Approval",
};

const statusColor: Record<TransferStatus, string> = {
  TRANSFER_STATUS_UNSPECIFIED: "text-gray-500",
  TRANSFER_STATUS_PENDING: "text-yellow-500",
  TRANSFER_STATUS_IN_PROGRESS: "text-emerald-400",
  TRANSFER_STATUS_COMPLETED: "text-emerald-400",
  TRANSFER_STATUS_FAILED: "text-red-400",
  TRANSFER_STATUS_CANCELLED: "text-gray-500",
  TRANSFER_STATUS_AWAITING_APPROVAL: "text-amber-400",
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

type TransferStep = "select" | "encrypt" | "upload" | "done";

export default function Transfers() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [transfers, setTransfers] = useState<TransferInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [showSend, setShowSend] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetDevice, setTargetDevice] = useState("");
  const [sendMode, setSendMode] = useState<"device" | "friend">("device");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string>("");
  const [friendDevices, setFriendDevices] = useState<Device[]>([]);
  const [sending, setSending] = useState(false);
  const [sendStep, setSendStep] = useState<TransferStep>("select");
  const [uploadProgress, setUploadProgress] = useState<{ sent: number; total: number } | null>(null);
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>("prepare");

  const uploadStartRef = useRef<number>(0);
  const chunkSizeRef = useRef<number>(262144);

  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ received: number } | null>(null);

  const myDevice = devices.find((d) => d.is_approved && !d.is_revoked);

  const fetchData = useCallback(async () => {
    try {
      const [devRes, friendsList] = await Promise.all([
        listDevices(),
        listFriends().catch(() => [] as Friend[]),
      ]);
      const approved = devRes.devices.filter((d) => d.is_approved && !d.is_revoked);
      setDevices(approved);
      setFriends(friendsList);

      const first = approved.find((d) => d.node_id);
      if (first) {
        try { await ensureDeviceKeys(first.device_id); } catch {}
        const txRes = await listTransfers(first.node_id);
        setTransfers(txRes.transfers || []);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  async function handleSelectFriend(friendUserId: string) {
    setSelectedFriend(friendUserId);
    setTargetDevice("");
    try {
      const devs = await getFriendDevices(friendUserId);
      setFriendDevices(devs);
    } catch {
      toast.error("Failed to load friend's devices");
      setFriendDevices([]);
    }
  }

  async function handleSend() {
    if (!selectedFile || !myDevice?.node_id) return;

    const isFriend = sendMode === "friend";
    if (isFriend && !targetDevice) return;
    if (!isFriend && !targetDevice) return;

    setSending(true);
    setUploadProgress(null);

    try {
      setSendStep("encrypt");
      setPipelineStep("encrypt");

      const buffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const contentHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      let receiverNodeId: string;
      let receiverStaticPub: Uint8Array;

      if (isFriend) {
        // Sending to a friend's device
        const allDevs = [...devices, ...friendDevices];
        const target = allDevs.find((d) => d.device_id === targetDevice);
        if (!target?.node_id) throw new Error("Target device has no node ID");
        receiverNodeId = target.node_id;
        receiverStaticPub = await getRemoteDeviceKeyByNodeId(receiverNodeId);
      } else {
        // Sending to own device
        const target = devices.find((d) => d.device_id === targetDevice);
        if (!target?.node_id) throw new Error("Target device has no node ID");
        receiverNodeId = target.node_id;
        receiverStaticPub = await getRemoteDeviceKey(target.device_id);
      }

      // Generate ephemeral keypair ONCE and reuse it
      const ephemeral = await generateEphemeralKeyPair();
      const ephemeralPubB64 = btoa(String.fromCharCode(...ephemeral.publicKeyBytes));

      // Initiate transfer to get the transfer_id
      const transfer = await initiateTransfer({
        sender_node_id: myDevice.node_id,
        receiver_node_id: receiverNodeId,
        filename: selectedFile.name,
        total_size_bytes: selectedFile.size,
        content_hash: contentHash,
        chunk_size_bytes: 262144,
        sender_ephemeral_pubkey: ephemeralPubB64,
      });

      // Derive AES key with actual transfer_id
      const aesKey = await deriveTransferKey(
        ephemeral.privateKey,
        receiverStaticPub,
        ephemeral.publicKeyBytes,
        receiverStaticPub,
        transfer.transfer_id,
      );

      setShowSend(false);

      setSendStep("upload");
      setPipelineStep("upload");
      setUploadProgress({ sent: 0, total: transfer.total_chunks });
      uploadStartRef.current = Date.now();
      chunkSizeRef.current = 262144;

      await uploadFile(transfer.transfer_id, selectedFile, aesKey, (sent, total) => {
        setUploadProgress({ sent, total });
      });

      setPipelineStep("verify");
      setSendStep("done");
      setPipelineStep("complete");
      setUploadProgress(null);
      setSelectedFile(null);
      setTargetDevice("");
      setSelectedFriend("");
      setFriendDevices([]);
      toast.success("File sent successfully");
      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || "Failed to send file");
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

  async function handleDownload(transfer: TransferInfo) {
    if (!myDevice?.node_id || !myDevice?.device_id) return;
    setDownloading(true);

    try {
      let ephemeralPubB64 = transfer.sender_ephemeral_pubkey;
      if (!ephemeralPubB64) {
        const status = await getTransferStatus(transfer.transfer_id);
        ephemeralPubB64 = status.sender_ephemeral_pubkey;
      }
      if (!ephemeralPubB64) throw new Error("Transfer has no ephemeral key. Cannot decrypt.");

      const binary = atob(ephemeralPubB64);
      const ephemeralPubBytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) ephemeralPubBytes[i] = binary.charCodeAt(i);

      const aesKey = await deriveReceiverKey(
        myDevice.device_id,
        ephemeralPubBytes,
        transfer.transfer_id,
      );

      setDownloadProgress({ received: 0 });

      const blob = await downloadFile(
        transfer.transfer_id,
        myDevice.node_id,
        aesKey,
        (received) => {
          setDownloadProgress({ received });
        }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = transfer.filename || "downloaded-file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("File downloaded and decrypted");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || "Failed to download or decrypt file");
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
          <h1 className="text-xl font-medium text-gray-100">File Sharing</h1>
          <p className="text-xs text-gray-500 mt-1">Secure transfer pipeline with end-to-end encryption</p>
        </div>
        {myDevice?.node_id ? (
          <button
            onClick={() => { setShowSend(true); setSendStep("select"); }}
            className="px-4 py-1.5 rounded-md bg-emerald-500 text-gray-950 text-sm font-medium hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Send File
          </button>
        ) : (
          <span className="text-xs text-gray-600">Register a device to send files</span>
        )}
      </div>

      {/* Pipeline */}
      <div className="glass-card-static p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-gray-500">Transfer Pipeline</p>
          <p className="text-xs text-gray-600">prepare / encrypt / upload / verify / complete</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <PipelinePill label="Prepare" step="prepare" current={pipelineStep} icon={<CircleDot className="w-3 h-3" />} />
          <PipelinePill label="Encrypt" step="encrypt" current={pipelineStep} icon={<Lock className="w-3 h-3" />} />
          <PipelinePill label="Upload" step="upload" current={pipelineStep} icon={<Upload className="w-3 h-3" />} />
          <PipelinePill label="Verify" step="verify" current={pipelineStep} icon={<ShieldCheck className="w-3 h-3" />} />
          <PipelinePill label="Complete" step="complete" current={pipelineStep} icon={<Check className="w-3 h-3" />} />
        </div>
      </div>

      {/* Upload progress */}
      {uploadProgress && (
        <div className="glass-card-static p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
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
              className="h-1.5 rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${uploadProgress.total > 0 ? (uploadProgress.sent / uploadProgress.total) * 100 : 0}%` }}
            />
          </div>
          <UploadStats sent={uploadProgress.sent} total={uploadProgress.total} startTime={uploadStartRef.current} chunkSize={chunkSizeRef.current} />
          <div className="flex items-center gap-2 text-xs">
            <StepDot active={sendStep === "encrypt"} done={sendStep === "upload" || sendStep === "done"} />
            <span className={sendStep === "encrypt" ? "text-emerald-400" : "text-gray-600"}>Encrypt</span>
            <span className="text-gray-800">—</span>
            <StepDot active={sendStep === "upload"} done={sendStep === "done"} />
            <span className={sendStep === "upload" ? "text-emerald-400" : "text-gray-600"}>Upload</span>
            <span className="text-gray-800">—</span>
            <StepDot active={false} done={sendStep === "done"} />
            <span className={sendStep === "done" ? "text-emerald-400" : "text-gray-600"}>Complete</span>
          </div>
        </div>
      )}

      {/* Download progress */}
      {downloadProgress && (
        <div className="glass-card-static p-4">
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
                ? "bg-emerald-500/10 text-emerald-400"
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
        <div className="drop-zone p-8 text-center">
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
              <div key={t.transfer_id} className="glass-card px-4 py-3">
                <div className="flex items-center gap-4">
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

                  <div className="flex items-center gap-4 shrink-0">
                    {isActive(t.status) ? (
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-900/80 border border-gray-800/60 ${statusColor[t.status]}`}>{statusLabel[t.status]}</span>
                          <span className="text-xs text-gray-500 tabular-nums">{t.progress_percent}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1">
                          <div
                            className="h-1 rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${t.progress_percent}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-900/80 border border-gray-800/60 ${statusColor[t.status]}`}>{statusLabel[t.status]}</span>
                    )}

                    {!isSender && t.status === "TRANSFER_STATUS_COMPLETED" && (
                      <button
                        onClick={() => handleDownload(t)}
                        disabled={downloading}
                        className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-40 transition-colors"
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
          <div className="drop-zone p-10 text-center">
            <FileUp className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">No transfers</p>
            <p className="text-xs text-gray-600 mt-1 mb-3">Send a file to another device to get started</p>
            {myDevice?.node_id && (
              <button
                onClick={() => { setShowSend(true); setSendStep("select"); }}
                className="px-4 py-1.5 rounded-md bg-emerald-500 text-gray-950 text-xs font-medium hover:bg-emerald-400 transition-colors"
              >
                Send your first file
              </button>
            )}
          </div>
        )
      )}

      {/* Send File Modal */}
      {showSend && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowSend(false)}>
          <div className="glass-card-static p-6 w-full max-w-md space-y-5 shadow-[0_20px_40px_rgba(0,0,0,0.45)]" onClick={(e) => e.stopPropagation()}>
            <div>
              <h2 className="text-base font-medium text-gray-100">Send File</h2>
              <p className="text-xs text-gray-500 mt-1">Select a file and recipient</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">File</p>
              {selectedFile ? (
                <div className="flex items-center justify-between glass-card-static px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatBytes(selectedFile.size)}</p>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="text-xs text-gray-500 hover:text-gray-300 ml-3">
                    Change
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-1 drop-zone px-4 py-6 cursor-pointer hover:border-emerald-500/30 transition-colors">
                  <FileUp className="w-6 h-6 text-gray-600 mb-1" />
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

            {/* Recipient mode toggle */}
            <div>
              <div className="flex gap-1 p-1 bg-gray-900/60 rounded-lg mb-3">
                <button
                  onClick={() => { setSendMode("device"); setTargetDevice(""); setSelectedFriend(""); setFriendDevices([]); }}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                    sendMode === "device"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  My Devices
                </button>
                <button
                  onClick={() => { setSendMode("friend"); setTargetDevice(""); }}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                    sendMode === "friend"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" />
                    To Friend
                  </span>
                </button>
              </div>

              {sendMode === "device" ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-500 mb-2">Send to your device</p>
                  {otherDevices.length > 0 ? (
                    otherDevices.map((d) => (
                      <label
                        key={d.device_id}
                        className={`flex items-center justify-between rounded-md border px-4 py-2.5 cursor-pointer transition-colors ${
                          targetDevice === d.device_id
                            ? "border-emerald-500/30 bg-emerald-500/5"
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
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 ml-3" />
                        )}
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-4 border border-gray-800/40 rounded-md">
                      <p className="text-xs text-gray-600">No other approved devices found.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Step 1: Pick a friend */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Select friend</p>
                    {friends.length > 0 ? (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {friends.map((f) => (
                          <label
                            key={f.id}
                            className={`flex items-center justify-between rounded-md border px-4 py-2 cursor-pointer transition-colors ${
                              selectedFriend === f.user.user_id
                                ? "border-emerald-500/30 bg-emerald-500/5"
                                : "border-gray-800/40 bg-gray-800/30 hover:border-gray-700"
                            }`}
                          >
                            <input
                              type="radio"
                              name="friend"
                              value={f.user.user_id}
                              checked={selectedFriend === f.user.user_id}
                              onChange={() => handleSelectFriend(f.user.user_id)}
                              className="sr-only"
                            />
                            <p className="text-sm text-gray-200">{f.user.username}</p>
                            {selectedFriend === f.user.user_id && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                            )}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 border border-gray-800/40 rounded-md">
                        <p className="text-xs text-gray-600">No friends yet. Add friends first!</p>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Pick friend's device */}
                  {selectedFriend && friendDevices.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Select device</p>
                      <div className="space-y-1.5">
                        {friendDevices.map((d) => (
                          <label
                            key={d.device_id}
                            className={`flex items-center justify-between rounded-md border px-4 py-2 cursor-pointer transition-colors ${
                              targetDevice === d.device_id
                                ? "border-emerald-500/30 bg-emerald-500/5"
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
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 ml-3" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedFriend && friendDevices.length === 0 && (
                    <p className="text-xs text-gray-600 text-center py-2">
                      This friend has no active devices.
                    </p>
                  )}

                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-emerald-500/60" />
                    E2E encrypted &middot; Requires friend approval
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSend(false)} className="px-3 py-1.5 rounded-md text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!selectedFile || !targetDevice || sending}
                className="px-5 py-1.5 rounded-md bg-emerald-500 text-gray-950 text-sm font-medium hover:bg-emerald-400 disabled:opacity-40 transition-colors"
              >
                {sending ? "Processing..." : "Send"}
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
  if (active) return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />;
  return <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />;
}

const pipelineOrder: PipelineStep[] = ["prepare", "encrypt", "upload", "verify", "complete"];

function PipelinePill({ label, step, current, icon }: { label: string; step: PipelineStep; current: PipelineStep; icon: React.ReactNode }) {
  const currentIdx = pipelineOrder.indexOf(current);
  const stepIdx = pipelineOrder.indexOf(step);
  const isDone = stepIdx < currentIdx;
  const isActive = step === current;

  return (
    <div
      className={`rounded-md border px-3 py-2 text-xs text-center transition-all duration-300 flex items-center justify-center gap-1.5 ${
        isDone
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : isActive
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 pipeline-active"
            : "border-gray-800/40 bg-gray-900/40 text-gray-500"
      }`}
    >
      {isDone ? <Check className="w-3 h-3" /> : icon}
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

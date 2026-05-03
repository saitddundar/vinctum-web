import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { FileUp, Upload, Lock, ShieldCheck, CircleDot, Check, X } from "lucide-react";
import type { Device } from "../types/device";
import type { TransferInfo, TransferStatus } from "../types/transfer";
import { listDevices } from "../lib/device-api";
import { initiateTransfer, listTransfers, cancelTransfer, getTransferStatus, uploadFile, downloadFile } from "../lib/transfer-api";
import { ensureDeviceKeys, getRemoteDeviceKey, generateEphemeralKeyPair, deriveTransferKey, deriveReceiverKey } from "../lib/device-key";

function formatBytes(b: number) {
  if (!b) return "0 B";
  const k = 1024, s = ["B","KB","MB","GB","TB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${parseFloat((b / k ** i).toFixed(1))} ${s[i]}`;
}
function timeAgo(iso: string) {
  if (!iso) return "";
  const d = new Date(iso); if (isNaN(d.getTime())) return "";
  const m = Math.floor((Date.now() - d.getTime()) / 60000);
  if (m < 1) return "just now"; if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function isActive(s: TransferStatus) {
  return s === "TRANSFER_STATUS_PENDING" || s === "TRANSFER_STATUS_IN_PROGRESS";
}

const STATUS_LABEL: Record<TransferStatus, string> = {
  TRANSFER_STATUS_UNSPECIFIED: "Unknown",
  TRANSFER_STATUS_PENDING:     "Pending",
  TRANSFER_STATUS_IN_PROGRESS: "Transferring",
  TRANSFER_STATUS_COMPLETED:   "Completed",
  TRANSFER_STATUS_FAILED:      "Failed",
  TRANSFER_STATUS_CANCELLED:   "Cancelled",
};
const STATUS_COLOR: Record<TransferStatus, string> = {
  TRANSFER_STATUS_UNSPECIFIED: "var(--muted-2)",
  TRANSFER_STATUS_PENDING:     "var(--amber)",
  TRANSFER_STATUS_IN_PROGRESS: "var(--amber)",
  TRANSFER_STATUS_COMPLETED:   "var(--accent)",
  TRANSFER_STATUS_FAILED:      "var(--red)",
  TRANSFER_STATUS_CANCELLED:   "var(--muted-2)",
};

type FilterStatus = "all" | "active" | "completed" | "failed";
type PipelineStep = "prepare" | "encrypt" | "upload" | "verify" | "complete";
const PIPELINE_ORDER: PipelineStep[] = ["prepare","encrypt","upload","verify","complete"];
const PIPELINE_ICONS: Record<PipelineStep, React.ReactNode> = {
  prepare:  <CircleDot  size={11}/>,
  encrypt:  <Lock       size={11}/>,
  upload:   <Upload     size={11}/>,
  verify:   <ShieldCheck size={11}/>,
  complete: <Check      size={11}/>,
};

export default function Transfers() {
  const [devices,        setDevices]        = useState<Device[]>([]);
  const [transfers,      setTransfers]      = useState<TransferInfo[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [filter,         setFilter]         = useState<FilterStatus>("all");
  const [showSend,       setShowSend]       = useState(false);
  const [selectedFile,   setSelectedFile]   = useState<File | null>(null);
  const [targetDevice,   setTargetDevice]   = useState("");
  const [sending,        setSending]        = useState(false);
  const [pipelineStep,   setPipelineStep]   = useState<PipelineStep>("prepare");
  const [uploadProgress, setUploadProgress] = useState<{ sent: number; total: number } | null>(null);
  const [downloading,    setDownloading]    = useState(false);
  const [downloadChunks, setDownloadChunks] = useState<number | null>(null);
  const uploadStartRef = useRef<number>(0);
  const myDevice = devices.find(d => d.is_approved && !d.is_revoked);

  const fetchData = useCallback(async () => {
    try {
      const dR = await listDevices();
      const approved = dR.devices.filter((d: Device) => d.is_approved && !d.is_revoked);
      setDevices(approved);
      const first = approved.find((d: Device) => d.node_id);
      if (first) {
        try { await ensureDeviceKeys(first.device_id); } catch {}
        const tR = await listTransfers(first.node_id);
        setTransfers(tR.transfers || []);
      }
    } catch (e: any) { toast.error(e?.response?.data?.error || "Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const activeIds = transfers.filter(t => isActive(t.status)).map(t => t.transfer_id);
    if (!activeIds.length) return;
    const iv = setInterval(async () => {
      const updates = await Promise.allSettled(activeIds.map(id => getTransferStatus(id)));
      setTransfers(prev => prev.map(t => {
        const idx = activeIds.indexOf(t.transfer_id);
        if (idx === -1) return t;
        const r = updates[idx];
        if (r.status !== "fulfilled") return t;
        const s = r.value;
        return { ...t, status: s.status, progress_percent: s.total_chunks > 0 ? Math.round((s.chunks_transferred / s.total_chunks) * 100) : t.progress_percent };
      }));
    }, 3000);
    return () => clearInterval(iv);
  }, [transfers.map(t => t.transfer_id + t.status).join(",")]);

  async function handleSend() {
    if (!selectedFile || !targetDevice || !myDevice?.node_id) return;
    setSending(true); setUploadProgress(null);
    try {
      setPipelineStep("encrypt");
      const buf = await selectedFile.arrayBuffer();
      const hashBuf = await crypto.subtle.digest("SHA-256", buf);
      const contentHash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,"0")).join("");
      const target = devices.find(d => d.device_id === targetDevice);
      if (!target?.node_id) throw new Error("Target device has no node ID");
      const receiverPub = await getRemoteDeviceKey(target.device_id);
      const ephemeral = await generateEphemeralKeyPair();
      const ephPubB64 = btoa(String.fromCharCode(...ephemeral.publicKeyBytes));
      const tx = await initiateTransfer({ sender_node_id: myDevice.node_id, receiver_node_id: target.node_id, filename: selectedFile.name, total_size_bytes: selectedFile.size, content_hash: contentHash, chunk_size_bytes: 262144, sender_ephemeral_pubkey: ephPubB64 });
      const aesKey = await deriveTransferKey(ephemeral.privateKey, receiverPub, ephemeral.publicKeyBytes, receiverPub, tx.transfer_id);
      setShowSend(false);
      setPipelineStep("upload");
      setUploadProgress({ sent: 0, total: tx.total_chunks });
      uploadStartRef.current = Date.now();
      await uploadFile(tx.transfer_id, selectedFile, aesKey, (sent, total) => setUploadProgress({ sent, total }));
      setPipelineStep("verify");
      setPipelineStep("complete");
      setUploadProgress(null); setSelectedFile(null); setTargetDevice("");
      toast.success("File sent successfully");
      await fetchData();
    } catch (e: any) { toast.error(e?.response?.data?.error || e.message || "Failed to send file"); setUploadProgress(null); }
    finally { setSending(false); setPipelineStep("prepare"); }
  }

  async function handleCancel(id: string) {
    try { await cancelTransfer(id, "Cancelled by user"); toast.success("Transfer cancelled"); await fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.error || "Failed"); }
  }

  async function handleDownload(t: TransferInfo) {
    if (!myDevice?.node_id || !myDevice?.device_id) return;
    setDownloading(true);
    try {
      let ephB64 = t.sender_ephemeral_pubkey;
      if (!ephB64) { const s = await getTransferStatus(t.transfer_id); ephB64 = s.sender_ephemeral_pubkey; }
      if (!ephB64) throw new Error("No ephemeral key.");
      const bin = atob(ephB64);
      const ephBytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) ephBytes[i] = bin.charCodeAt(i);
      const aesKey = await deriveReceiverKey(myDevice.device_id, ephBytes, t.transfer_id);
      setDownloadChunks(0);
      const blob = await downloadFile(t.transfer_id, myDevice.node_id, aesKey, r => setDownloadChunks(r));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = t.filename || "file";
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success("File downloaded and decrypted");
    } catch (e: any) { toast.error(e?.response?.data?.error || e.message || "Failed to download"); }
    finally { setDownloading(false); setDownloadChunks(null); }
  }

  const filtered = transfers.filter(t => {
    if (filter === "active")    return isActive(t.status);
    if (filter === "completed") return t.status === "TRANSFER_STATUS_COMPLETED";
    if (filter === "failed")    return t.status === "TRANSFER_STATUS_FAILED" || t.status === "TRANSFER_STATUS_CANCELLED";
    return true;
  });
  const counts = {
    all:       transfers.length,
    active:    transfers.filter(t => isActive(t.status)).length,
    completed: transfers.filter(t => t.status === "TRANSFER_STATUS_COMPLETED").length,
    failed:    transfers.filter(t => t.status === "TRANSFER_STATUS_FAILED" || t.status === "TRANSFER_STATUS_CANCELLED").length,
  };
  const otherDevices = devices.filter(d => d.device_id !== myDevice?.device_id);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>File sharing</h1>
      {[1,2,3].map(i => <div key={i} className="glass-card-static animate-pulse" style={{ height: 56 }} />)}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div className="flex items-start justify-between">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>
            File <span className="font-serif" style={{ color: "var(--accent)" }}>sharing</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 6, marginBottom: 0 }}>
            End-to-end encrypted. We never see filenames, contents, or metadata.
          </p>
        </div>
        {myDevice?.node_id ? (
          <button onClick={() => { setShowSend(true); setPipelineStep("prepare"); }} className="btn btn-primary" style={{ fontSize: 12.5 }}>
            <FileUp size={13} /> Send a file
          </button>
        ) : (
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Register a device to send files</span>
        )}
      </div>

      {/* Pipeline */}
      <div className="glass-card-static" style={{ padding: 16 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".09em", fontWeight: 600 }}>Transfer pipeline</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
          {PIPELINE_ORDER.map(step => {
            const idx = PIPELINE_ORDER.indexOf(step);
            const curIdx = PIPELINE_ORDER.indexOf(pipelineStep);
            const isDone = idx < curIdx, isActive2 = step === pipelineStep;
            return (
              <div key={step} style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${isDone || isActive2 ? "oklch(0.78 0.15 160 / .3)" : "var(--line)"}`, background: isDone || isActive2 ? "oklch(0.78 0.15 160 / .06)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11.5, color: isDone || isActive2 ? "var(--accent)" : "var(--muted-2)", transition: "all .25s", boxShadow: isActive2 ? "0 0 10px oklch(0.78 0.15 160 / .2)" : "none" }}>
                {isDone ? <Check size={11} /> : PIPELINE_ICONS[step]}
                <span style={{ textTransform: "capitalize" }}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload progress */}
      {uploadProgress && (
        <div className="glass-card-static" style={{ padding: 16 }}>
          <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
            <div style={{ width: 14, height: 14, border: "2px solid var(--accent)", borderTopColor: "transparent", borderRadius: 99, animation: "spin .8s linear infinite" }} />
            <span style={{ fontSize: 13, color: "var(--fg-2)" }}>Uploading…</span>
            <span className="font-mono" style={{ fontSize: 12, color: "var(--muted)", marginLeft: "auto" }}>
              {uploadProgress.total > 0 ? `${Math.round((uploadProgress.sent / uploadProgress.total) * 100)}%` : "0%"}
            </span>
          </div>
          <div style={{ height: 3, background: "var(--line)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${uploadProgress.total > 0 ? (uploadProgress.sent / uploadProgress.total) * 100 : 0}%`, height: "100%", background: "var(--accent)", transition: "width .3s" }} />
          </div>
          <div className="font-mono" style={{ fontSize: 11, color: "var(--muted-2)", marginTop: 8 }}>
            Chunks: {uploadProgress.sent} / {uploadProgress.total}
          </div>
        </div>
      )}

      {/* Download progress */}
      {downloadChunks !== null && (
        <div className="glass-card-static" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 14, height: 14, border: "2px solid var(--cyan)", borderTopColor: "transparent", borderRadius: 99, animation: "spin .8s linear infinite" }} />
          <span style={{ fontSize: 13, color: "var(--fg-2)" }}>Downloading and decrypting…</span>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--muted-2)", marginLeft: "auto" }}>{downloadChunks} chunks</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2" style={{ borderBottom: "1px solid var(--line)", paddingBottom: 14 }}>
        {(["all","active","completed","failed"] as FilterStatus[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, border: "none", background: filter === f ? "oklch(0.78 0.15 160 / .1)" : "transparent", color: filter === f ? "var(--accent)" : "var(--muted)", cursor: "pointer", fontFamily: "Inter" }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {counts[f] > 0 && <span style={{ fontSize: 10, color: "var(--muted-2)", marginLeft: 5 }}>{counts[f]}</span>}
          </button>
        ))}
      </div>

      {/* Transfer list */}
      {filtered.length > 0 ? (
        <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr 100px 120px 110px 80px", padding: "9px 20px", borderBottom: "1px solid var(--line)", background: "oklch(1 0 0 / .015)" }}>
            {["File","Route","Size","Speed","Status",""].map(h => <div key={h} style={{ fontSize: 10, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".09em", fontWeight: 600 }}>{h}</div>)}
          </div>
          {filtered.map((t, i, arr) => {
            const isSender = t.sender_node_id === myDevice?.node_id;
            return (
              <div key={t.transfer_id} style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr 100px 120px 110px 80px", padding: "14px 20px", borderBottom: i < arr.length - 1 ? "1px solid oklch(1 0 0 / .04)" : "none", alignItems: "center", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="font-mono" style={{ fontSize: 12.5, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.filename}</div>
                  {isActive(t.status) && (
                    <div className="flex items-center gap-2" style={{ marginTop: 5 }}>
                      <div style={{ flex: 1, height: 3, background: "var(--line)", borderRadius: 99, overflow: "hidden", maxWidth: 200 }}>
                        <div style={{ width: `${t.progress_percent}%`, height: "100%", background: "var(--amber)" }} />
                      </div>
                      <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>{t.progress_percent}%</span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-2)", display: "flex", alignItems: "center", gap: 5 }}>
                  <span>{isSender ? "Sent" : "Recv"}</span>
                  <span style={{ fontSize: 10, color: "var(--muted-2)" }}>· {timeAgo(t.created_at)}</span>
                </div>
                <div className="font-mono" style={{ fontSize: 12, color: "var(--fg-2)" }}>{formatBytes(t.total_size_bytes)}</div>
                <div className="font-mono" style={{ fontSize: 12, color: "var(--muted-2)" }}>—</div>
                <div>
                  <span style={{ fontSize: 11, color: STATUS_COLOR[t.status] }}>{STATUS_LABEL[t.status]}</span>
                </div>
                <div className="flex gap-2">
                  {!isSender && t.status === "TRANSFER_STATUS_COMPLETED" && (
                    <button onClick={() => handleDownload(t)} disabled={downloading} style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>↓</button>
                  )}
                  {isActive(t.status) && (
                    <button onClick={() => handleCancel(t.transfer_id)} style={{ fontSize: 11, color: "var(--muted-2)", background: "none", border: "none", cursor: "pointer" }}>
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="drop-zone" style={{ padding: 52, textAlign: "center" }}>
          <FileUp size={28} style={{ color: "var(--muted-2)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>No transfers</p>
          {myDevice?.node_id && (
            <button onClick={() => { setShowSend(true); setPipelineStep("prepare"); }} className="btn btn-primary" style={{ fontSize: 12 }}>Send your first file</button>
          )}
        </div>
      )}

      {/* Send modal */}
      {showSend && (
        <div onClick={() => setShowSend(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div onClick={e => e.stopPropagation()} className="glass-card-static" style={{ width: "100%", maxWidth: 440, padding: 28, boxShadow: "0 24px 48px rgba(0,0,0,.5)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 500, margin: "0 0 5px" }}>Send a file</h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 22 }}>Select file and recipient device.</p>
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 11, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600, marginBottom: 8 }}>File</p>
              {selectedFile ? (
                <div className="flex items-center justify-between glass-card-static" style={{ padding: "12px 14px" }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="font-mono" style={{ fontSize: 12.5, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedFile.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{formatBytes(selectedFile.size)}</div>
                  </div>
                  <button onClick={() => setSelectedFile(null)} style={{ fontSize: 11.5, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", marginLeft: 12 }}>Change</button>
                </div>
              ) : (
                <label className="drop-zone" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "24px 16px", cursor: "pointer" }}>
                  <FileUp size={22} style={{ color: "var(--muted-2)" }} />
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>Click to select file</span>
                  <input type="file" style={{ display: "none" }} onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                </label>
              )}
            </div>
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 11, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600, marginBottom: 8 }}>Send to</p>
              {otherDevices.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {otherDevices.map(d => (
                    <label key={d.device_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 9, border: `1px solid ${targetDevice === d.device_id ? "oklch(0.78 0.15 160 / .35)" : "var(--line)"}`, background: targetDevice === d.device_id ? "oklch(0.78 0.15 160 / .05)" : "oklch(1 0 0 / .015)", cursor: "pointer" }}>
                      <input type="radio" name="target" value={d.device_id} checked={targetDevice === d.device_id} onChange={e => setTargetDevice(e.target.value)} style={{ display: "none" }} />
                      <div>
                        <div style={{ fontSize: 13, color: "var(--fg)" }}>{d.name}</div>
                        {d.node_id && <div className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)", marginTop: 2 }}>{d.node_id.slice(0, 16)}…</div>}
                      </div>
                      {targetDevice === d.device_id && <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--accent)" }} />}
                    </label>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "14px 16px", border: "1px solid var(--line)", borderRadius: 9, textAlign: "center" }}>
                  <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>No other devices available. Pair another device first.</p>
                </div>
              )}
            </div>
            <p style={{ fontSize: 11.5, color: "var(--muted-2)", marginBottom: 18 }}>Keys derived via X25519 ECDH automatically. No manual sharing needed.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSend(false)} className="btn btn-ghost" style={{ fontSize: 12.5 }}>Cancel</button>
              <button onClick={handleSend} disabled={!selectedFile || !targetDevice || sending} className="btn btn-primary" style={{ fontSize: 12.5 }}>{sending ? "Processing…" : "Send"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

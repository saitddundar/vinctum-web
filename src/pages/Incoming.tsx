import { useEffect, useState, useCallback } from "react";
import { Check, X, Download, HardDrive, Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { listDevices } from "../lib/device-api";
import { listTransfers, getTransferStatus } from "../lib/transfer-api";
import { respondToTransfer } from "../lib/friend-api";
import { useNotifications } from "../context/NotificationContext";
import type { TransferInfo, TransferStatusResponse } from "../types/transfer";
import type { Device } from "../types/device";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type ViewTab = "pending" | "active";

export default function Incoming() {
  const { refresh: refreshNotifications } = useNotifications();
  const [tab, setTab] = useState<ViewTab>("pending");
  const [pending, setPending] = useState<TransferInfo[]>([]);
  const [active, setActive] = useState<TransferInfo[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<Record<string, TransferStatusResponse>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const devs = await listDevices();
      const approved = (devs.devices || []).filter(
        (d: Device) => d.is_approved && !d.is_revoked && d.node_id
      );
      setDevices(approved);

      const pendingList: TransferInfo[] = [];
      const activeList: TransferInfo[] = [];

      for (const d of approved) {
        try {
          const res = await listTransfers(d.node_id);
          for (const t of res.transfers || []) {
            if (t.receiver_node_id !== d.node_id) continue;
            if (t.status === "TRANSFER_STATUS_AWAITING_APPROVAL") {
              pendingList.push(t);
            } else if (
              t.status === "TRANSFER_STATUS_PENDING" ||
              t.status === "TRANSFER_STATUS_IN_PROGRESS" ||
              t.status === "TRANSFER_STATUS_COMPLETED" ||
              t.status === "TRANSFER_STATUS_FAILED"
            ) {
              activeList.push(t);
            }
          }
        } catch {
          // skip
        }
      }
      setPending(pendingList);
      setActive(activeList);
    } catch {
      toast.error("Failed to load incoming transfers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Poll active transfers for progress
  useEffect(() => {
    if (active.length === 0) return;
    const inProgress = active.filter(
      t => t.status === "TRANSFER_STATUS_PENDING" || t.status === "TRANSFER_STATUS_IN_PROGRESS"
    );
    if (inProgress.length === 0) return;

    const interval = setInterval(async () => {
      for (const t of inProgress) {
        try {
          const s = await getTransferStatus(t.transfer_id);
          setStatuses(prev => ({ ...prev, [t.transfer_id]: s }));
          if (s.status !== t.status) {
            setActive(prev => prev.map(a =>
              a.transfer_id === t.transfer_id
                ? { ...a, status: s.status as TransferInfo["status"] }
                : a
            ));
          }
        } catch { /* skip */ }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [active]);

  async function handleRespond(transfer: TransferInfo, accept: boolean) {
    try {
      await respondToTransfer(transfer.transfer_id, transfer.receiver_node_id, accept);
      toast.success(accept ? "Transfer accepted — receiving file" : "Transfer rejected");
      setPending(prev => prev.filter(t => t.transfer_id !== transfer.transfer_id));
      if (accept) {
        setActive(prev => [{ ...transfer, status: "TRANSFER_STATUS_PENDING" }, ...prev]);
        setTab("active");
      }
      refreshNotifications();
    } catch {
      toast.error("Failed to respond to transfer");
    }
  }

  const pendingCount = pending.length;
  const activeCount = active.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>Receive</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>Incoming file transfers sent to your devices</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: 4, background: "oklch(0.16 0.012 235)", borderRadius: 10, border: "1px solid var(--line)", width: "fit-content" }}>
        {([
          { key: "pending" as ViewTab, label: "Pending approval", count: pendingCount },
          { key: "active" as ViewTab, label: "Active", count: activeCount },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
              background: tab === t.key ? "oklch(0.78 0.15 160 / .1)" : "transparent",
              border: tab === t.key ? "1px solid oklch(0.78 0.15 160 / .2)" : "1px solid transparent",
              color: tab === t.key ? "var(--accent)" : "var(--muted)",
              transition: "all .15s",
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                marginLeft: 8, padding: "2px 7px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                background: tab === t.key ? "oklch(0.78 0.15 160 / .2)" : "oklch(1 0 0 / .06)",
                color: tab === t.key ? "var(--accent)" : "var(--muted-2)",
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Loader2 size={22} style={{ color: "var(--accent)", animation: "spin 1s linear infinite" }} />
        </div>
      ) : tab === "pending" ? (
        <PendingList transfers={pending} devices={devices} onRespond={handleRespond} />
      ) : (
        <ActiveList transfers={active} devices={devices} statuses={statuses} />
      )}
    </div>
  );
}

/* ─── Pending List ─────────────────────────────────────────── */
function PendingList({
  transfers, devices, onRespond,
}: {
  transfers: TransferInfo[];
  devices: Device[];
  onRespond: (t: TransferInfo, accept: boolean) => void;
}) {
  if (transfers.length === 0) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center", border: "1px dashed var(--line-2)", borderRadius: 14 }}>
        <Download size={32} style={{ color: "var(--muted-2)", margin: "0 auto 14px" }} />
        <p style={{ fontSize: 14, color: "var(--fg-2)", margin: 0 }}>No pending transfers</p>
        <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>When someone sends you a file, it will appear here for approval.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {transfers.map(t => {
        const device = devices.find(d => d.node_id === t.receiver_node_id);
        return (
          <div key={t.transfer_id} style={{
            padding: "18px 20px", borderRadius: 12,
            background: "var(--panel)", border: "1px solid var(--line)",
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            {/* File info */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.filename}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 5 }}>
                  <span className="font-mono" style={{ fontSize: 11.5, color: "var(--cyan)" }}>{formatBytes(t.total_size_bytes)}</span>
                  <span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>{timeAgo(t.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: "var(--muted)", background: "oklch(1 0 0 / .03)", padding: "4px 10px", borderRadius: 6, border: "1px solid var(--line)" }}>
                <HardDrive size={11} />
                {device?.name || t.receiver_node_id.slice(0, 8)}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => onRespond(t, false)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
                  background: "oklch(0.72 0.17 25 / .06)", border: "1px solid oklch(0.72 0.17 25 / .15)",
                  color: "var(--red)", fontSize: 12.5, fontWeight: 500, cursor: "pointer",
                }}
              >
                <X size={13} /> Reject
              </button>
              <button
                onClick={() => onRespond(t, true)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
                  background: "oklch(0.78 0.15 160 / .1)", border: "1px solid oklch(0.78 0.15 160 / .25)",
                  color: "var(--accent)", fontSize: 12.5, fontWeight: 500, cursor: "pointer",
                }}
              >
                <Check size={13} /> Accept
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Active List ──────────────────────────────────────────── */
function ActiveList({
  transfers, devices, statuses,
}: {
  transfers: TransferInfo[];
  devices: Device[];
  statuses: Record<string, TransferStatusResponse>;
}) {
  if (transfers.length === 0) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center", border: "1px dashed var(--line-2)", borderRadius: 14 }}>
        <Clock size={32} style={{ color: "var(--muted-2)", margin: "0 auto 14px" }} />
        <p style={{ fontSize: 14, color: "var(--fg-2)", margin: 0 }}>No active transfers</p>
        <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>Accepted transfers will show their progress here.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {transfers.map(t => {
        const device = devices.find(d => d.node_id === t.receiver_node_id);
        const status = statuses[t.transfer_id];
        const progress = status
          ? status.total_chunks > 0 ? Math.round((status.chunks_transferred / status.total_chunks) * 100) : 0
          : t.progress_percent || 0;
        const isCompleted = t.status === "TRANSFER_STATUS_COMPLETED";
        const isFailed = t.status === "TRANSFER_STATUS_FAILED";
        const isInProgress = t.status === "TRANSFER_STATUS_IN_PROGRESS" || t.status === "TRANSFER_STATUS_PENDING";

        return (
          <div key={t.transfer_id} style={{
            padding: "18px 20px", borderRadius: 12,
            background: "var(--panel)",
            border: `1px solid ${isCompleted ? "oklch(0.78 0.15 160 / .2)" : isFailed ? "oklch(0.72 0.17 25 / .2)" : "var(--line)"}`,
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            {/* Top row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.filename}
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 5 }}>
                  <span className="font-mono" style={{ fontSize: 11.5, color: "var(--cyan)" }}>{formatBytes(t.total_size_bytes)}</span>
                  <span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>{timeAgo(t.created_at)}</span>
                  {device && (
                    <span className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--muted-2)" }}>
                      <HardDrive size={10} /> {device.name}
                    </span>
                  )}
                </div>
              </div>
              {isInProgress && (
                <span className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                  {progress}%
                </span>
              )}
            </div>

            {/* Progress bar */}
            {(isInProgress || isCompleted) && (
              <div style={{ height: 4, borderRadius: 99, background: "oklch(1 0 0 / .06)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  width: `${isCompleted ? 100 : progress}%`,
                  background: isCompleted
                    ? "linear-gradient(90deg, var(--accent), var(--cyan))"
                    : "var(--accent)",
                  transition: "width .5s ease",
                }} />
              </div>
            )}

            {/* Status details */}
            {status && isInProgress && (
              <div style={{ display: "flex", gap: 20, fontSize: 11.5, color: "var(--muted)" }}>
                <span>Chunks: {status.chunks_transferred}/{status.total_chunks}</span>
                <span>Received: {formatBytes(status.bytes_transferred)} / {formatBytes(status.total_bytes)}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Status Badge ─────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
    TRANSFER_STATUS_PENDING: { label: "Queued", color: "var(--amber)", bg: "oklch(0.84 0.13 85 / .1)", icon: Clock },
    TRANSFER_STATUS_IN_PROGRESS: { label: "Transferring", color: "var(--accent)", bg: "oklch(0.78 0.15 160 / .1)", icon: Loader2 },
    TRANSFER_STATUS_COMPLETED: { label: "Completed", color: "var(--accent)", bg: "oklch(0.78 0.15 160 / .1)", icon: CheckCircle2 },
    TRANSFER_STATUS_FAILED: { label: "Failed", color: "var(--red)", bg: "oklch(0.72 0.17 25 / .1)", icon: XCircle },
  };

  const c = config[status] || { label: status, color: "var(--muted)", bg: "oklch(1 0 0 / .04)", icon: Clock };
  const Icon = c.icon;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 6,
      background: c.bg, fontSize: 10.5, fontWeight: 500, color: c.color, flexShrink: 0,
    }}>
      <Icon size={10} style={status === "TRANSFER_STATUS_IN_PROGRESS" ? { animation: "spin 1s linear infinite" } : undefined} />
      {c.label}
    </span>
  );
}

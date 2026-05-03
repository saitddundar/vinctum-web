import { useEffect, useState } from "react";
import { Check, X, FileDown, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { listDevices } from "../lib/device-api";
import { listTransfers } from "../lib/transfer-api";
import { respondToTransfer } from "../lib/friend-api";
import { useNotifications } from "../context/NotificationContext";
import type { TransferInfo } from "../types/transfer";
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

export default function Incoming() {
  const { refresh: refreshNotifications } = useNotifications();
  const [transfers, setTransfers] = useState<TransferInfo[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const devs = await listDevices();
      const approved = (devs.devices || []).filter(
        (d: Device) => d.is_approved && !d.is_revoked && d.node_id
      );
      setDevices(approved);

      const allTransfers: TransferInfo[] = [];
      for (const d of approved) {
        try {
          const res = await listTransfers(d.node_id);
          const incoming = (res.transfers || []).filter(
            (t: TransferInfo) =>
              t.receiver_node_id === d.node_id &&
              t.status === "TRANSFER_STATUS_AWAITING_APPROVAL"
          );
          allTransfers.push(...incoming);
        } catch {
          // skip
        }
      }
      setTransfers(allTransfers);
    } catch {
      toast.error("Failed to load incoming transfers");
    } finally {
      setLoading(false);
    }
  }

  async function handleRespond(transfer: TransferInfo, accept: boolean) {
    try {
      await respondToTransfer(transfer.transfer_id, transfer.receiver_node_id, accept);
      toast.success(accept ? "Transfer accepted" : "Transfer rejected");
      setTransfers((prev) => prev.filter((t) => t.transfer_id !== transfer.transfer_id));
      refreshNotifications();
    } catch {
      toast.error("Failed to respond to transfer");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-100">Incoming Transfers</h1>
        <p className="text-sm text-gray-500 mt-1">
          Approve or reject files sent to you by friends.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : transfers.length === 0 ? (
        <div className="text-center py-12">
          <FileDown className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No pending incoming transfers.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transfers.map((t) => {
            const receiverDevice = devices.find((d) => d.node_id === t.receiver_node_id);
            return (
              <div
                key={t.transfer_id}
                className="glass-card-static p-4 rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {t.filename}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatBytes(t.total_size_bytes)} &middot; {timeAgo(t.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>To: {receiverDevice?.name || t.receiver_node_id.slice(0, 8)}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(t, true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-md text-xs hover:bg-emerald-500/30 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(t, false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-md text-xs hover:bg-red-500/20 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

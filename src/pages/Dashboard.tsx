import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Monitor, Smartphone, Tablet, FileUp, MonitorSmartphone, Send, Plus, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { listDevices, listPeerSessions } from "../lib/device-api";
import { listTransfers } from "../lib/transfer-api";
import { normalizeDeviceType } from "../types/device";
import type { Device, PeerSession } from "../types/device";
import type { TransferInfo } from "../types/transfer";
import NetworkMesh from "../components/NetworkMesh";

function DeviceIcon({ type, className = "w-4 h-4" }: { type: string; className?: string }) {
  switch (type) {
    case "phone": return <Smartphone className={className} />;
    case "tablet": return <Tablet className={className} />;
    default: return <Monitor className={className} />;
  }
}

const statusLabel: Record<string, string> = {
  TRANSFER_STATUS_PENDING: "Pending",
  TRANSFER_STATUS_IN_PROGRESS: "Transferring",
  TRANSFER_STATUS_COMPLETED: "Completed",
  TRANSFER_STATUS_FAILED: "Failed",
  TRANSFER_STATUS_CANCELLED: "Cancelled",
};

const statusDot: Record<string, string> = {
  TRANSFER_STATUS_PENDING: "bg-yellow-500",
  TRANSFER_STATUS_IN_PROGRESS: "bg-emerald-400",
  TRANSFER_STATUS_COMPLETED: "bg-emerald-400",
  TRANSFER_STATUS_FAILED: "bg-red-400",
  TRANSFER_STATUS_CANCELLED: "bg-gray-500",
};

function timeAgo(iso: string) {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [sessions, setSessions] = useState<PeerSession[]>([]);
  const [transfers, setTransfers] = useState<TransferInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listDevices().catch(() => ({ devices: [] })),
      listPeerSessions().catch(() => ({ sessions: [] })),
    ])
      .then(async ([devRes, sessRes]) => {
        const devs = devRes.devices || [];
        setDevices(devs);
        setSessions(sessRes.sessions || []);

        const approved = devs.find((d: Device) => d.is_approved && !d.is_revoked && d.node_id);
        if (approved) {
          try {
            const txRes = await listTransfers(approved.node_id);
            setTransfers(txRes.transfers || []);
          } catch {}
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const approved = devices.filter((d) => d.is_approved && !d.is_revoked);
  const pending = devices.filter((d) => !d.is_approved && !d.is_revoked);
  const activeSessions = sessions.filter((s) => s.is_active);
  const recentTransfers = transfers.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-7 bg-gray-800/50 rounded w-52 animate-pulse" />
          <div className="h-4 bg-gray-800/30 rounded w-36 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card-static p-5 space-y-3 animate-pulse">
              <div className="h-10 bg-gray-800/40 rounded w-12" />
              <div className="h-3 bg-gray-800/30 rounded w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-medium text-gray-100">
          {user?.username ? `Welcome, ${user.username}` : "Dashboard"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your Vinctum network</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/devices" className="group glass-card p-5">
          <p className="text-4xl font-bold text-gray-50">{approved.length}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Devices</p>
          {pending.length > 0 ? (
            <p className="text-xs text-yellow-500 mt-2">{pending.length} pending approval</p>
          ) : (
            <p className="text-xs text-gray-600 mt-2">All approved</p>
          )}
        </Link>

        <Link to="/sessions" className="group glass-card p-5">
          <p className="text-4xl font-bold text-gray-50">{activeSessions.length}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Active Sessions</p>
          <p className="text-xs text-gray-600 mt-2">
            {activeSessions.length > 0
              ? `${activeSessions.reduce((sum, s) => sum + s.devices.length, 0)} connected devices`
              : "No active sessions"}
          </p>
        </Link>

        <Link to="/transfers" className="group glass-card p-5">
          <p className="text-4xl font-bold text-gray-50">{transfers.length}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Transfers</p>
          <p className="text-xs text-gray-600 mt-2">
            {transfers.filter((t) => t.status === "TRANSFER_STATUS_COMPLETED").length} completed
          </p>
        </Link>
      </div>

      {/* Network Mesh */}
      <NetworkMesh devices={devices} sessions={sessions} />

      {/* Recent Transfers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-400">Recent Transfers</p>
          <Link to="/transfers" className="text-xs text-gray-500 hover:text-emerald-400 transition-colors">
            View all
          </Link>
        </div>
        {recentTransfers.length > 0 ? (
          <div className="space-y-2">
            {recentTransfers.map((t) => (
              <div key={t.transfer_id} className="glass-card flex items-center gap-3 px-4 py-3">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[t.status] || "bg-gray-500"}`} />
                <span className="text-sm text-gray-300 truncate flex-1">{t.filename}</span>
                <span className="text-xs text-gray-600">{formatBytes(t.total_size_bytes)}</span>
                <span className="text-xs text-gray-600">{statusLabel[t.status] || t.status}</span>
                <span className="text-xs text-gray-700">{timeAgo(t.created_at)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="drop-zone p-10 text-center">
            <FileUp className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No transfers yet</p>
            <Link to="/transfers" className="inline-block mt-3 px-4 py-1.5 rounded-md bg-emerald-500 text-gray-950 text-xs font-medium hover:bg-emerald-400 transition-colors">
              Send your first file
            </Link>
          </div>
        )}
      </div>

      {/* Recent Devices */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-400">Your Devices</p>
          <Link to="/devices" className="text-xs text-gray-500 hover:text-emerald-400 transition-colors">
            Manage
          </Link>
        </div>
        {approved.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {approved.slice(0, 6).map((d) => (
              <div key={d.device_id} className="glass-card flex items-center gap-3 px-4 py-3">
                <DeviceIcon type={normalizeDeviceType(d.device_type)} className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300 truncate">{d.name}</span>
                <span className="text-xs text-gray-600 ml-auto">{timeAgo(d.last_active)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="drop-zone p-10 text-center">
            <MonitorSmartphone className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No devices registered yet</p>
            <Link to="/devices" className="inline-block mt-3 px-4 py-1.5 rounded-md bg-emerald-500 text-gray-950 text-xs font-medium hover:bg-emerald-400 transition-colors">
              Add your first device
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-sm text-gray-400 mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/transfers" className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-500 text-gray-950 text-sm font-medium hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            <Send className="w-4 h-4" />
            Send a file
          </Link>
          <Link to="/devices" className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-700/50 bg-transparent text-sm text-gray-300 hover:text-gray-100 hover:border-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            <Plus className="w-4 h-4" />
            Add device
          </Link>
          <Link to="/sessions" className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-700/50 bg-transparent text-sm text-gray-300 hover:text-gray-100 hover:border-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            <Users className="w-4 h-4" />
            Create session
          </Link>
        </div>
      </div>
    </div>
  );
}

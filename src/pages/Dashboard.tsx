import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listDevices, listPeerSessions } from "../lib/device-api";
import { listTransfers } from "../lib/transfer-api";
import { normalizeDeviceType } from "../types/device";
import type { Device, PeerSession } from "../types/device";
import type { TransferInfo } from "../types/transfer";

function DeviceIcon({ type, className = "w-4 h-4" }: { type: string; className?: string }) {
  switch (type) {
    case "phone":
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18.01" /></svg>;
    case "tablet":
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18.01" /></svg>;
    default:
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
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
  TRANSFER_STATUS_IN_PROGRESS: "bg-blue-400",
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
            <div key={i} className="rounded-md border border-gray-800/40 bg-gray-900/50 p-5 space-y-3 animate-pulse">
              <div className="h-3 bg-gray-800/50 rounded w-20" />
              <div className="h-8 bg-gray-800/40 rounded w-12" />
              <div className="h-3 bg-gray-800/30 rounded w-28" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 rounded-md border border-gray-800/40 bg-gray-900/50 animate-pulse" />
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
        <Link to="/devices" className="group rounded-md border border-gray-800/40 bg-gray-900/50 p-5 hover:border-gray-700 hover:-translate-y-px transition-all duration-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Devices</p>
          <p className="text-2xl font-light text-gray-100 mt-2">{approved.length}</p>
          {pending.length > 0 ? (
            <p className="text-xs text-yellow-500 mt-1">{pending.length} pending approval</p>
          ) : (
            <p className="text-xs text-gray-600 mt-1">All approved</p>
          )}
        </Link>

        <Link to="/sessions" className="group rounded-md border border-gray-800/40 bg-gray-900/50 p-5 hover:border-gray-700 hover:-translate-y-px transition-all duration-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Active Sessions</p>
          <p className="text-2xl font-light text-gray-100 mt-2">{activeSessions.length}</p>
          <p className="text-xs text-gray-600 mt-1">
            {activeSessions.length > 0
              ? `${activeSessions.reduce((sum, s) => sum + s.devices.length, 0)} connected devices`
              : "No active sessions"}
          </p>
        </Link>

        <Link to="/transfers" className="group rounded-md border border-gray-800/40 bg-gray-900/50 p-5 hover:border-gray-700 hover:-translate-y-px transition-all duration-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Transfers</p>
          <p className="text-2xl font-light text-gray-100 mt-2">{transfers.length}</p>
          <p className="text-xs text-gray-600 mt-1">
            {transfers.filter((t) => t.status === "TRANSFER_STATUS_COMPLETED").length} completed
          </p>
        </Link>
      </div>

      {/* Recent Transfers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-400">Recent Transfers</p>
          <Link to="/transfers" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            View all
          </Link>
        </div>
        {recentTransfers.length > 0 ? (
          <div className="space-y-2">
            {recentTransfers.map((t) => (
              <div key={t.transfer_id} className="flex items-center gap-3 rounded-md border border-gray-800/40 bg-gray-900/50 px-4 py-3 hover:border-gray-700/70 hover:-translate-y-px transition-all duration-200">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[t.status] || "bg-gray-500"}`} />
                <span className="text-sm text-gray-300 truncate flex-1">{t.filename}</span>
                <span className="text-xs text-gray-600">{formatBytes(t.total_size_bytes)}</span>
                <span className="text-xs text-gray-600">{statusLabel[t.status] || t.status}</span>
                <span className="text-xs text-gray-700">{timeAgo(t.created_at)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-gray-800/40 bg-gray-900/30 p-6 text-center">
            <p className="text-gray-500 text-sm">No transfers yet</p>
            <Link to="/transfers" className="inline-block mt-2 px-4 py-1.5 rounded-md bg-gray-800/80 border border-gray-700/50 text-xs text-gray-300 hover:text-gray-100 hover:border-gray-600 hover:scale-[1.02] transition-all duration-200">
              Send your first file
            </Link>
          </div>
        )}
      </div>

      {/* Recent Devices */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-400">Your Devices</p>
          <Link to="/devices" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Manage
          </Link>
        </div>
        {approved.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {approved.slice(0, 6).map((d) => (
              <div key={d.device_id} className="flex items-center gap-3 rounded-md border border-gray-800/40 bg-gray-900/50 px-4 py-3 hover:border-gray-700/70 hover:-translate-y-px transition-all duration-200">
                <DeviceIcon type={normalizeDeviceType(d.device_type)} className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300 truncate">{d.name}</span>
                <span className="text-xs text-gray-600 ml-auto">{timeAgo(d.last_active)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-gray-800/40 bg-gray-900/30 p-6 text-center">
            <p className="text-gray-500 text-sm">No devices registered yet</p>
            <Link to="/devices" className="inline-block mt-2 px-4 py-1.5 rounded-md bg-gray-800/80 border border-gray-700/50 text-xs text-gray-300 hover:text-gray-100 hover:border-gray-600 hover:scale-[1.02] transition-all duration-200">
              Add your first device
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-sm text-gray-400 mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/transfers" className="px-4 py-2 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            Send a file
          </Link>
          <Link to="/devices" className="px-4 py-2 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            Add device
          </Link>
          <Link to="/sessions" className="px-4 py-2 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            Create session
          </Link>
        </div>
      </div>
    </div>
  );
}

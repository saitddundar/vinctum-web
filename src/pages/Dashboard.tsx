import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listDevices } from "../lib/device-api";
import { listPeerSessions } from "../lib/device-api";
import { fetchMLHealth } from "../lib/ml-api";
import type { Device, PeerSession } from "../types/device";
import type { HealthResponse } from "../types/api";

function timeAgo(iso: string) {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [sessions, setSessions] = useState<PeerSession[]>([]);
  const [mlHealth, setMlHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listDevices().catch(() => ({ devices: [] })),
      listPeerSessions().catch(() => ({ sessions: [] })),
      fetchMLHealth(),
    ])
      .then(([devRes, sessRes, health]) => {
        setDevices(devRes.devices || []);
        setSessions(sessRes.sessions || []);
        setMlHealth(health);
      })
      .finally(() => setLoading(false));
  }, []);

  const approved = devices.filter((d) => d.is_approved && !d.is_revoked);
  const pending = devices.filter((d) => !d.is_approved && !d.is_revoked);
  const activeSessions = sessions.filter((s) => s.is_active);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-gray-800/50 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-md border border-gray-800/40 bg-gray-900/50 animate-pulse" />
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
        <Link to="/devices" className="group rounded-md border border-gray-800/40 bg-gray-900/50 p-5 hover:border-gray-700 transition-colors">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Devices</p>
          <p className="text-2xl font-light text-gray-100 mt-2">{approved.length}</p>
          {pending.length > 0 && (
            <p className="text-xs text-yellow-500 mt-1">{pending.length} pending approval</p>
          )}
        </Link>

        <Link to="/sessions" className="group rounded-md border border-gray-800/40 bg-gray-900/50 p-5 hover:border-gray-700 transition-colors">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Active Sessions</p>
          <p className="text-2xl font-light text-gray-100 mt-2">{activeSessions.length}</p>
          {activeSessions.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {activeSessions.reduce((sum, s) => sum + s.devices.length, 0)} connected devices
            </p>
          )}
        </Link>

        <div className="rounded-md border border-gray-800/40 bg-gray-900/50 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider">ML Service</p>
          {mlHealth ? (
            <>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-sm text-gray-300">Online</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">v{mlHealth.version}</p>
            </>
          ) : (
            <div className="flex items-center gap-2 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
              <span className="text-sm text-gray-500">Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Devices */}
      {approved.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-400">Your Devices</p>
            <Link to="/devices" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Manage
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {approved.slice(0, 6).map((d) => (
              <div key={d.device_id} className="flex items-center gap-3 rounded-md border border-gray-800/40 bg-gray-900/50 px-4 py-3">
                <span className="text-sm text-gray-300">{d.name}</span>
                <span className="text-xs text-gray-600 ml-auto">{timeAgo(d.last_active)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <p className="text-sm text-gray-400 mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/transfers"
            className="px-4 py-2 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 transition-colors"
          >
            Send a file
          </Link>
          <Link
            to="/devices"
            className="px-4 py-2 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 transition-colors"
          >
            Add device
          </Link>
          <Link
            to="/sessions"
            className="px-4 py-2 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 transition-colors"
          >
            Create session
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {approved.length === 0 && (
        <div className="rounded-md border border-gray-800/40 bg-gray-900/30 p-8 text-center">
          <p className="text-gray-400">No devices registered yet</p>
          <p className="text-xs text-gray-600 mt-1">
            Start by <Link to="/devices" className="text-gray-400 underline underline-offset-2">adding your first device</Link>
          </p>
        </div>
      )}
    </div>
  );
}

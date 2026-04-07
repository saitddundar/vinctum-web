import { useEffect, useState } from "react";
import type { PeerSession, Device } from "../types/device";
import { listPeerSessions, createPeerSession, closePeerSession, listDevices } from "../lib/device-api";

const typeIcon = {
  pc: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z",
  phone: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  tablet: "M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25V4.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z",
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

export default function Sessions() {
  const [sessions, setSessions] = useState<PeerSession[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  async function fetchData() {
    const [sessRes, devRes] = await Promise.all([listPeerSessions(), listDevices()]);
    setSessions(sessRes.sessions);
    setDevices(devRes.devices.filter((d) => d.is_approved && !d.is_revoked));
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleCreate() {
    if (!newName) return;
    setCreating(true);
    const myDevice = devices[0];
    await createPeerSession({ name: newName, device_id: myDevice?.device_id || "" });
    await fetchData();
    setShowCreate(false);
    setNewName("");
    setCreating(false);
  }

  async function handleClose(sessionId: string) {
    await closePeerSession(sessionId);
    await fetchData();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Sessions</h1>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-gray-900 border border-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sessions</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors"
        >
          New Session
        </button>
      </div>

      {sessions.length === 0 && !showCreate && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-gray-500">No active sessions</p>
          <p className="text-xs text-gray-600 mt-1">Create a session to group your devices together</p>
        </div>
      )}

      {/* Create session form */}
      {showCreate && (
        <div className="rounded-lg border border-blue-800 bg-blue-900/20 p-5 space-y-3">
          <p className="text-sm font-medium text-blue-300">New Peer Session</p>
          <input
            type="text"
            placeholder="Session name (e.g. Work Session)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!newName || creating}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {creating ? "Creating..." : "Create Session"}
            </button>
          </div>
        </div>
      )}

      {/* Session cards */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.session_id} className="rounded-lg border border-gray-800 bg-gray-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white">{session.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Created {timeAgo(session.created_at)} | {session.devices.length} device{session.devices.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded border bg-emerald-900/50 text-emerald-300 border-emerald-800">
                  active
                </span>
                <button
                  onClick={() => handleClose(session.session_id)}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Devices in session */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {session.devices.map((d) => (
                <div key={d.device_id} className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-800/50 px-4 py-3">
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={typeIcon[d.device_type] || typeIcon.pc} />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 truncate">{d.name}</p>
                    <p className="text-xs text-gray-500">{d.device_type} | {timeAgo(d.last_active)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

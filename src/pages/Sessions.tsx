import { useEffect, useState } from "react";
import type { PeerSession, Device } from "../types/device";
import { normalizeDeviceType } from "../types/device";
import {
  listPeerSessions,
  createPeerSession,
  closePeerSession,
  joinPeerSession,
  leavePeerSession,
  listDevices,
} from "../lib/device-api";

const typeIcon: Record<string, string> = {
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
  const [selectedDevice, setSelectedDevice] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [addDeviceSession, setAddDeviceSession] = useState<string | null>(null);
  const [addDeviceId, setAddDeviceId] = useState("");

  async function fetchData() {
    try {
      const [sessRes, devRes] = await Promise.all([listPeerSessions(), listDevices()]);
      setSessions(sessRes.sessions);
      setDevices(devRes.devices.filter((d) => d.is_approved && !d.is_revoked));
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleCreate() {
    if (!newName || !selectedDevice) return;
    setCreating(true);
    setError("");
    try {
      await createPeerSession({ name: newName, device_id: selectedDevice });
      await fetchData();
      setShowCreate(false);
      setNewName("");
      setSelectedDevice("");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to create session");
    } finally {
      setCreating(false);
    }
  }

  async function handleClose(sessionId: string) {
    setError("");
    try {
      await closePeerSession(sessionId);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to close session");
    }
  }

  async function handleJoin(sessionId: string) {
    if (!addDeviceId) return;
    setError("");
    try {
      await joinPeerSession(sessionId, addDeviceId);
      await fetchData();
      setAddDeviceSession(null);
      setAddDeviceId("");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to join session");
    }
  }

  async function handleLeave(sessionId: string, deviceId: string) {
    setError("");
    try {
      await leavePeerSession(sessionId, deviceId);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to leave session");
    }
  }

  function devicesNotInSession(session: PeerSession): Device[] {
    const sessionDeviceIds = new Set(session.devices.map((d) => d.device_id));
    return devices.filter((d) => !sessionDeviceIds.has(d.device_id));
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

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-300 text-xs">Dismiss</button>
        </div>
      )}

      {sessions.length === 0 && !showCreate && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-gray-500">No active sessions</p>
          <p className="text-xs text-gray-600 mt-1">Create a session to group your devices for file sharing</p>
        </div>
      )}

      {/* Create session form */}
      {showCreate && (
        <div className="rounded-lg border border-blue-800 bg-blue-900/20 p-5 space-y-4">
          <p className="text-sm font-medium text-blue-300">New Peer Session</p>
          <input
            type="text"
            placeholder="Session name (e.g. Work Session)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <div>
            <p className="text-xs text-gray-400 mb-2">Select initial device</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {devices.map((d) => (
                <label
                  key={d.device_id}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                    selectedDevice === d.device_id
                      ? "border-blue-600 bg-blue-900/30"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="create-device"
                    value={d.device_id}
                    checked={selectedDevice === d.device_id}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    className="sr-only"
                  />
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={typeIcon[normalizeDeviceType(d.device_type)] || typeIcon.pc} />
                  </svg>
                  <span className="text-sm text-gray-200">{d.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowCreate(false); setSelectedDevice(""); }} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!newName || !selectedDevice || creating}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {creating ? "Creating..." : "Create Session"}
            </button>
          </div>
        </div>
      )}

      {/* Session cards */}
      <div className="space-y-4">
        {sessions.map((session) => {
          const available = devicesNotInSession(session);
          const isAdding = addDeviceSession === session.session_id;

          return (
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
                  {available.length > 0 && (
                    <button
                      onClick={() => { setAddDeviceSession(isAdding ? null : session.session_id); setAddDeviceId(""); }}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {isAdding ? "Cancel" : "+ Add Device"}
                    </button>
                  )}
                  <button
                    onClick={() => handleClose(session.session_id)}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Add device to session */}
              {isAdding && (
                <div className="rounded-lg border border-blue-800/50 bg-blue-900/10 p-3 space-y-2">
                  <p className="text-xs text-blue-300">Select device to add:</p>
                  <div className="flex flex-wrap gap-2">
                    {available.map((d) => (
                      <label
                        key={d.device_id}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 cursor-pointer text-xs transition-colors ${
                          addDeviceId === d.device_id
                            ? "border-blue-600 bg-blue-900/30 text-blue-200"
                            : "border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="join-device"
                          value={d.device_id}
                          checked={addDeviceId === d.device_id}
                          onChange={(e) => setAddDeviceId(e.target.value)}
                          className="sr-only"
                        />
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={typeIcon[normalizeDeviceType(d.device_type)] || typeIcon.pc} />
                        </svg>
                        {d.name}
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => handleJoin(session.session_id)}
                    disabled={!addDeviceId}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-xs font-medium disabled:opacity-50 transition-colors"
                  >
                    Add to Session
                  </button>
                </div>
              )}

              {/* Devices in session */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {session.devices.map((d) => (
                  <div key={d.device_id} className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-800/50 px-4 py-3">
                    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={typeIcon[normalizeDeviceType(d.device_type)] || typeIcon.pc} />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-200 truncate">{d.name}</p>
                      <p className="text-xs text-gray-500">{normalizeDeviceType(d.device_type)} | {timeAgo(d.last_active)}</p>
                    </div>
                    <button
                      onClick={() => handleLeave(session.session_id, d.device_id)}
                      className="text-xs text-gray-600 hover:text-red-400 transition-colors shrink-0"
                      title="Remove from session"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {session.devices.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-2">No devices in this session</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

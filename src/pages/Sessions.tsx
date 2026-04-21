import { useEffect, useState } from "react";
import { toast } from "sonner";
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

const typeLabel: Record<string, string> = {
  pc: "Computer",
  phone: "Phone",
  tablet: "Tablet",
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
      toast.success("Session created");
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
        <h1 className="text-xl font-medium text-gray-100">Sessions</h1>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-28 rounded-md bg-gray-900/50 border border-gray-800/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-100">Sessions</h1>
          <p className="text-xs text-gray-500 mt-1">{sessions.length} active</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 rounded-md bg-gray-100 text-gray-900 text-sm font-medium hover:bg-white transition-colors"
        >
          New Session
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-900/40 bg-red-950/30 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => setError("")} className="text-xs text-red-500 hover:text-red-300">Dismiss</button>
        </div>
      )}

      {sessions.length === 0 && !showCreate && (
        <div className="rounded-md border border-gray-800/40 bg-gray-900/30 p-10 text-center">
          <p className="text-gray-400">No active sessions</p>
          <p className="text-xs text-gray-600 mt-1 mb-3">Create a session to group devices for file sharing</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-1.5 rounded-md bg-gray-800/80 border border-gray-700/50 text-xs text-gray-300 hover:text-gray-100 hover:border-gray-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Create your first session
          </button>
        </div>
      )}

      {/* Create */}
      {showCreate && (
        <div className="rounded-md border border-gray-800/40 bg-gray-900/50 p-5 space-y-4">
          <p className="text-sm text-gray-300">New Session</p>
          <input
            type="text"
            placeholder="Session name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            className="w-full bg-gray-800/80 border border-gray-700/50 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"
          />
          <div>
            <p className="text-xs text-gray-500 mb-2">Initial device</p>
            <div className="space-y-1.5">
              {devices.map((d) => (
                <label
                  key={d.device_id}
                  className={`flex items-center justify-between rounded-md border px-3 py-2 cursor-pointer transition-colors ${
                    selectedDevice === d.device_id
                      ? "border-gray-600 bg-gray-800/60"
                      : "border-gray-800/40 bg-gray-800/30 hover:border-gray-700"
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-200">{d.name}</span>
                    <span className="text-xs text-gray-600">{typeLabel[normalizeDeviceType(d.device_type)]}</span>
                  </div>
                  {selectedDevice === d.device_id && <span className="w-2 h-2 rounded-full bg-gray-300" />}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowCreate(false); setSelectedDevice(""); }} className="px-3 py-1.5 rounded-md text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!newName || !selectedDevice || creating}
              className="px-4 py-1.5 rounded-md bg-gray-100 text-gray-900 text-sm font-medium hover:bg-white disabled:opacity-40 transition-colors"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Session list */}
      <div className="space-y-3">
        {sessions.map((session) => {
          const available = devicesNotInSession(session);
          const isAdding = addDeviceSession === session.session_id;

          return (
            <div key={session.session_id} className="rounded-md border border-gray-800/40 bg-gray-900/50 p-4 space-y-3 hover:border-gray-700/70 hover:-translate-y-px transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-200">{session.name}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {session.devices.length} device{session.devices.length !== 1 ? "s" : ""} · {timeAgo(session.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {available.length > 0 && (
                    <button
                      onClick={() => { setAddDeviceSession(isAdding ? null : session.session_id); setAddDeviceId(""); }}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {isAdding ? "Cancel" : "Add device"}
                    </button>
                  )}
                  <button
                    onClick={() => handleClose(session.session_id)}
                    className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Add device */}
              {isAdding && (
                <div className="flex items-center gap-2 flex-wrap">
                  {available.map((d) => (
                    <label
                      key={d.device_id}
                      className={`rounded-md border px-3 py-1.5 cursor-pointer text-xs transition-colors ${
                        addDeviceId === d.device_id
                          ? "border-gray-600 bg-gray-800/60 text-gray-200"
                          : "border-gray-800/40 text-gray-500 hover:border-gray-700"
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
                      {d.name}
                    </label>
                  ))}
                  <button
                    onClick={() => handleJoin(session.session_id)}
                    disabled={!addDeviceId}
                    className="px-3 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 disabled:opacity-40 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}

              {/* Devices */}
              {session.devices.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {session.devices.map((d) => (
                    <div key={d.device_id} className="flex items-center gap-2 rounded-md border border-gray-800/40 bg-gray-800/30 px-3 py-2">
                      <span className="text-xs text-gray-300">{d.name}</span>
                      <span className="text-xs text-gray-700">{typeLabel[normalizeDeviceType(d.device_type)]}</span>
                      <button
                        onClick={() => handleLeave(session.session_id, d.device_id)}
                        className="text-gray-700 hover:text-red-400 transition-colors ml-1"
                        title="Remove"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-700">No devices in this session</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

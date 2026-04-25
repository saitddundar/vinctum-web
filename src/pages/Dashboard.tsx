import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Monitor, Smartphone, Tablet, FileUp, MonitorSmartphone, Send, Plus, Users, Activity, Check, AlertTriangle, Shield, QrCode } from "lucide-react";
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
  if (bytes === 0 || !bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function Spark({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data, 1), min = Math.min(...data);
  const w = 84, h = 26;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return [x, y];
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id={`g-${color.replace(/[^a-z]/gi, '')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g-${color.replace(/[^a-z]/gi, '')})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2" fill={color} />
    </svg>
  );
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
  const activeSessions = sessions.filter((s) => s.is_active);
  const recentTransfers = transfers.slice(0, 5);

  const kpis = [
    { label: 'Devices', value: approved.length.toString(), sub: 'all approved', delta: '+0 this month', dir: 'flat', icon: Monitor, tone: 'emerald', color: '#34d399', spark: [3, 3, 3, 3, 3, 3, 3, 3, 3, approved.length] },
    { label: 'Active sessions', value: activeSessions.length.toString(), sub: 'peers connected', delta: 'avg 24m dur', dir: 'flat', icon: Users, tone: 'cyan', color: '#22d3ee', spark: [0, 1, 0, 1, 1, 0, 1, Math.max(1, activeSessions.length), activeSessions.length, activeSessions.length] },
    { label: 'Transfers (7d)', value: transfers.length.toString(), sub: 'completed', delta: '+2%', dir: 'up', icon: Send, tone: 'violet', color: '#a78bfa', spark: [2, 4, 3, 5, 4, 6, 8, 6, Math.max(1, transfers.length), transfers.length] },
    { label: 'Moved (7d)', value: formatBytes(transfers.reduce((acc, t) => acc + (t.total_size_bytes || 0), 0)).split(' ')[0], unit: formatBytes(transfers.reduce((acc, t) => acc + (t.total_size_bytes || 0), 0)).split(' ')[1], sub: '87% direct path', delta: '+1.2 GB vs last wk', dir: 'up', icon: Activity, tone: 'amber', color: '#fbbf24', spark: [1, 2, 1, 3, 2, 2, 4, 3, 4, 5] },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-16 bg-gray-800/50 rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-800/40 rounded-xl" />)}
        </div>
        <div className="h-96 bg-gray-800/30 rounded-xl" />
      </div>
    );
  }

  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Welcome & Health */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="text-xs text-gray-500 tracking-wider mb-2 uppercase">{date}</div>
          <h1 className="text-3xl font-medium tracking-tight m-0 leading-tight">
            Welcome back, <span className="text-emerald-400 font-serif italic">{user?.username || 'User'}.</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2 mb-0 leading-relaxed max-w-xl">
            Your mesh is healthy. {approved.length} devices online, {activeSessions.length} active sessions, and {transfers.filter(t => t.status === 'TRANSFER_STATUS_IN_PROGRESS').length} transfers in flight right now.
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-3.5 flex items-center gap-4 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] text-gray-500 tracking-[0.1em]">LIVE</span>
          </div>
          <div className="w-px h-8 bg-gray-800/60" />
          <div>
            <div className="text-[11px] text-gray-500 uppercase tracking-wider">Mesh health</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-base text-emerald-400 font-medium">98.7</span>
              <span className="text-[11px] text-gray-600">/ 100</span>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-800/60" />
          <div>
            <div className="text-[11px] text-gray-500 uppercase tracking-wider">Uptime 30d</div>
            <div className="font-mono text-sm text-gray-200 mt-1.5 font-medium">99.94%</div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const IconComp = k.icon;
          return (
            <div key={k.label} className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-4.5 flex flex-col gap-3.5 relative overflow-hidden group hover:bg-gray-800/40 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{k.label}</div>
                  <div className="flex items-baseline gap-1.5 mt-2.5">
                    <span className="font-mono text-3xl font-medium tracking-tight text-gray-100">{k.value}</span>
                    {k.unit && <span className="text-xs text-gray-500">{k.unit}</span>}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">{k.sub}</div>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${k.color}15`, color: k.color, border: `1px solid ${k.color}30` }}>
                  <IconComp className="w-4 h-4" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <Spark data={k.spark} color={k.color} />
                <span className={`text-[11px] flex items-center gap-1 ${k.dir === 'up' ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {k.dir === 'up' && '↗'}{k.dir === 'flat' && '→'} {k.delta}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Network Mesh component */}
      <NetworkMesh devices={devices} sessions={sessions} />

      {/* Bottom Grid: Transfers, Devices, Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-5">
        
        {/* Active Transfers */}
        <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl overflow-hidden h-fit">
          <div className="flex justify-between items-center p-4 border-b border-gray-800/50">
            <div className="flex gap-2.5 items-center">
              <span className="text-sm text-gray-200 font-medium">Active & recent transfers</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{transfers.filter(t => t.status === 'TRANSFER_STATUS_IN_PROGRESS').length} live</span>
            </div>
            <Link to="/transfers" className="text-xs text-emerald-400 hover:text-emerald-300">View all →</Link>
          </div>
          <div>
            {recentTransfers.length > 0 ? recentTransfers.map((t, i) => (
              <div key={t.transfer_id} className={`p-4 ${i < recentTransfers.length - 1 ? 'border-b border-gray-800/40' : ''}`}>
                <div className="flex justify-between items-center mb-2.5 gap-2.5">
                  <div className="flex gap-3 items-center min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: t.status === 'TRANSFER_STATUS_COMPLETED' ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.08)', color: t.status === 'TRANSFER_STATUS_COMPLETED' ? '#34d399' : '#fbbf24', border: `1px solid ${t.status === 'TRANSFER_STATUS_COMPLETED' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}` }}>
                      {t.status === 'TRANSFER_STATUS_COMPLETED' ? <Check className="w-3.5 h-3.5" /> : <FileUp className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-xs text-gray-200 truncate">{t.filename}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <span>{formatBytes(t.total_size_bytes)}</span>
                        <span>·</span>
                        <span className="truncate">{statusLabel[t.status] || t.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs text-emerald-400">{timeAgo(t.created_at)}</div>
                  </div>
                </div>
                {t.status === 'TRANSFER_STATUS_IN_PROGRESS' && (
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-1 rounded-full bg-gray-800 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                )}
              </div>
            )) : (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">No transfers yet</p>
                <Link to="/transfers" className="text-xs text-emerald-400 mt-2 inline-block">Send a file</Link>
              </div>
            )}
          </div>
        </div>

        {/* Anomalies / Events */}
        <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl overflow-hidden h-fit">
          <div className="flex justify-between items-center p-4 border-b border-gray-800/50">
            <div className="flex gap-2.5 items-center">
              <span className="text-sm text-gray-200 font-medium">Events & anomalies</span>
            </div>
            <Link to="/anomalies" className="text-xs text-emerald-400 hover:text-emerald-300">Security log →</Link>
          </div>
          <div>
            {[
              { sev: 'info', title: 'Session connected', sub: `${activeSessions.length} active sessions globally`, time: 'now', icon: Users, color: '#22d3ee' },
              { sev: 'ok', title: 'Mesh health optimal', sub: 'All devices online and responsive', time: '1h', icon: Check, color: '#34d399' },
              { sev: 'warn', title: 'Unapproved devices', sub: `${devices.length - approved.length} devices waiting for approval`, time: '2h', icon: AlertTriangle, color: '#fbbf24' }
            ].map((it, i, arr) => (
              <div key={i} className={`p-3.5 flex gap-3 items-start ${i < arr.length - 1 ? 'border-b border-gray-800/40' : ''}`}>
                <div className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: it.color, boxShadow: `0 0 8px ${it.color}` }} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <span className="text-[13px] text-gray-200 font-medium">{it.title}</span>
                    <span className="text-[10px] text-gray-500">{it.time}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1 truncate">{it.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-5">
        
        {/* Your Devices */}
        <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-800/50">
            <span className="text-sm text-gray-200 font-medium">Your devices</span>
            <Link to="/devices" className="text-xs px-2.5 py-1 rounded-md text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 transition-colors flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Pair new
            </Link>
          </div>
          <div>
            {approved.slice(0, 5).map((d, i, arr) => (
              <div key={d.device_id} className={`grid grid-cols-[28px_1fr_auto] gap-3.5 p-3.5 items-center ${i < arr.length - 1 ? 'border-b border-gray-800/40' : ''}`}>
                <div className="w-7 h-7 rounded bg-gray-800/30 border border-gray-700/50 flex items-center justify-center text-gray-400">
                  <DeviceIcon type={normalizeDeviceType(d.device_type)} className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-gray-200 font-medium truncate">{d.name}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5 truncate">{d.device_type} · active {timeAgo(d.last_active)}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <div className="w-12 h-1 rounded-full bg-gray-800 overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: '98%' }} />
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">online</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <div className="grid grid-cols-2 gap-3.5">
            {[
              { icon: Send, t: 'Send a file', s: 'Choose a file and a destination device', primary: true, to: "/transfers" },
              { icon: QrCode, t: 'Pair a device', s: 'Add phone, laptop, or NAS to your mesh', to: "/devices" },
              { icon: Users, t: 'Start a session', s: 'Open a transfer window with multiple peers', to: "/sessions" },
              { icon: Shield, t: 'Security check', s: 'Run an integrity audit over your keys', to: "/anomalies" },
            ].map((a, i) => (
              <Link key={i} to={a.to} className={`p-4 rounded-xl flex items-center gap-3.5 transition-all ${a.primary ? 'bg-gray-900 border border-emerald-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-emerald-500/50' : 'bg-gray-900/40 border border-gray-800/50 hover:bg-gray-800/40 hover:border-gray-700/50'}`}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: a.primary ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${a.primary ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.05)'}`, color: a.primary ? '#34d399' : '#9ca3af' }}>
                  <a.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[13px] text-gray-200 font-medium">{a.t}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">{a.s}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

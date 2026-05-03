import { Monitor, Smartphone, Tablet, Server } from "lucide-react";
import type { Device, PeerSession } from "../types/device";
import { normalizeDeviceType } from "../types/device";

interface Props {
  devices: Device[];
  sessions: PeerSession[];
}

function getPositions(count: number, cx: number, cy: number, r: number) {
  if (count === 0) return [];
  if (count === 1) return [{ x: cx, y: cy }];
  if (count === 2) return [{ x: cx - 110, y: cy }, { x: cx + 110, y: cy }];
  const positions = [{ x: cx, y: cy }];
  for (let i = 1; i < count; i++) {
    const angle = ((i - 1) / (count - 1)) * Math.PI * 2 - Math.PI / 2;
    positions.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  return positions;
}

function isOnline(lastActive: string) {
  if (!lastActive) return false;
  return Date.now() - new Date(lastActive).getTime() < 5 * 60 * 1000;
}

function DeviceIcon({ type }: { type: string }) {
  const t = normalizeDeviceType(type as any);
  const cls = "text-[var(--fg-2)]";
  if (t === "phone")  return <Smartphone size={14} className={cls} />;
  if (t === "tablet") return <Tablet     size={14} className={cls} />;
  return <Monitor size={14} className={cls} />;
}

export default function NetworkMesh({ devices, sessions }: Props) {
  const W = 560, H = 260, cx = W / 2, cy = H / 2;
  const approved = devices.filter(d => d.is_approved && !d.is_revoked);

  if (approved.length === 0) {
    return (
      <div className="glass-card-static p-6">
        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted-2)", marginBottom: 16, fontWeight: 600 }}>Network topology</p>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div style={{
            width: 56, height: 56, borderRadius: 99,
            border: "2px dashed oklch(1 0 0 / .12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 12,
          }}>
            <Monitor size={22} style={{ color: "var(--muted-2)" }} />
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>Pair a device to see your network</p>
        </div>
      </div>
    );
  }

  const positions = getPositions(approved.length, cx, cy, 95);

  // Build connections from sessions
  const connections: { from: number; to: number; id: string }[] = [];
  sessions.forEach(s => {
    if (!s.is_active) return;
    const ids = s.devices.map(d => d.device_id);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = approved.findIndex(d => d.device_id === ids[i]);
        const b = approved.findIndex(d => d.device_id === ids[j]);
        if (a !== -1 && b !== -1) connections.push({ from: a, to: b, id: `${a}-${b}` });
      }
    }
  });
  if (connections.length === 0 && approved.length > 1) {
    for (let i = 1; i < approved.length; i++) connections.push({ from: 0, to: i, id: `0-${i}` });
  }

  return (
    <div className="glass-card-static p-5">
      <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted-2)", fontWeight: 600 }}>Network topology</p>
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span style={{ fontSize: 11, color: "var(--fg-2)" }}>{approved.length} online</span>
        </div>
      </div>
      <div className="flex justify-center overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: W, maxHeight: H }}>
          <defs>
            <radialGradient id="nGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="oklch(0.78 0.15 160)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="oklch(0.78 0.15 160)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Connection lines */}
          {connections.map(conn => {
            const a = positions[conn.from], b = positions[conn.to];
            return (
              <g key={conn.id}>
                <line
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke="oklch(0.78 0.15 160 / .2)" strokeWidth="1" strokeDasharray="4 3"
                />
                <circle r="2.5" fill="var(--accent)">
                  <animateMotion dur="3s" repeatCount="indefinite">
                    <mpath href={`#conn-path-${conn.id}`} />
                  </animateMotion>
                </circle>
                <path id={`conn-path-${conn.id}`} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} fill="none" />
              </g>
            );
          })}

          {/* Nodes */}
          {approved.map((device, i) => {
            const pos = positions[i];
            const online = isOnline(device.last_active);
            return (
              <g key={device.device_id}>
                <circle cx={pos.x} cy={pos.y} r={36} fill="url(#nGlow)" />
                <circle
                  cx={pos.x} cy={pos.y} r={26}
                  fill="oklch(0.2 0.014 235)"
                  stroke={online ? "oklch(0.78 0.15 160 / .45)" : "oklch(1 0 0 / .08)"}
                  strokeWidth="1"
                />
                {online && (
                  <circle cx={pos.x} cy={pos.y} r={26} fill="none"
                    stroke="oklch(0.78 0.15 160 / .2)" strokeDasharray="3 5">
                    <animateTransform attributeName="transform" type="rotate"
                      from={`0 ${pos.x} ${pos.y}`} to={`360 ${pos.x} ${pos.y}`}
                      dur="18s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={pos.x + 18} cy={pos.y - 18} r={4.5}
                  fill={online ? "var(--accent)" : "oklch(1 0 0 / .15)"}
                  stroke="oklch(0.148 0.012 235)" strokeWidth="1.5"
                />
                <foreignObject x={pos.x - 10} y={pos.y - 10} width="20" height="20">
                  <div style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <DeviceIcon type={device.device_type} />
                  </div>
                </foreignObject>
                <text x={pos.x} y={pos.y + 42}
                  textAnchor="middle"
                  style={{ fill: "var(--muted)", fontSize: 10, fontFamily: "Inter" }}>
                  {device.name.length > 14 ? device.name.slice(0, 14) + "…" : device.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

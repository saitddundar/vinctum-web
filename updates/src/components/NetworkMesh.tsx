import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { Device, PeerSession } from "../types/device";
import { normalizeDeviceType } from "../types/device";

interface Props {
  devices: Device[];
  sessions: PeerSession[];
}

function getNodePositions(count: number, cx: number, cy: number, radius: number) {
  if (count === 0) return [];
  if (count === 1) return [{ x: cx, y: cy }];
  if (count === 2) return [{ x: cx - 120, y: cy }, { x: cx + 120, y: cy }];

  const positions = [{ x: cx, y: cy }];
  for (let i = 1; i < count; i++) {
    const angle = ((i - 1) / (count - 1)) * Math.PI * 2 - Math.PI / 2;
    positions.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    });
  }
  return positions;
}

function isOnline(lastActive: string) {
  if (!lastActive) return false;
  return Date.now() - new Date(lastActive).getTime() < 5 * 60 * 1000;
}

function DeviceIconSvg({ type }: { type: string }) {
  const cls = "w-5 h-5 text-gray-400";
  switch (normalizeDeviceType(type)) {
    case "phone": return <Smartphone className={cls} />;
    case "tablet": return <Tablet className={cls} />;
    default: return <Monitor className={cls} />;
  }
}

export default function NetworkMesh({ devices, sessions }: Props) {
  const width = 600;
  const height = 280;
  const cx = width / 2;
  const cy = height / 2;

  const approved = devices.filter((d) => d.is_approved && !d.is_revoked);

  if (approved.length === 0) {
    return (
      <div className="glass-card-static p-6">
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-4">Network Topology</p>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-800/60 flex items-center justify-center mb-3">
            <Monitor className="w-6 h-6 text-gray-700" />
          </div>
          <p className="text-sm text-gray-500">Pair a device to see your network</p>
        </div>
      </div>
    );
  }

  const positions = getNodePositions(approved.length, cx, cy, 100);

  // Build connections from sessions
  const connections: { from: number; to: number; id: string }[] = [];
  sessions.forEach((s) => {
    if (!s.is_active) return;
    const sessionDeviceIds = s.devices.map((d) => d.device_id);
    for (let i = 0; i < sessionDeviceIds.length; i++) {
      for (let j = i + 1; j < sessionDeviceIds.length; j++) {
        const fromIdx = approved.findIndex((d) => d.device_id === sessionDeviceIds[i]);
        const toIdx = approved.findIndex((d) => d.device_id === sessionDeviceIds[j]);
        if (fromIdx !== -1 && toIdx !== -1) {
          connections.push({ from: fromIdx, to: toIdx, id: `${fromIdx}-${toIdx}` });
        }
      }
    }
  });

  // If no session connections, connect all to first device (implicit mesh)
  if (connections.length === 0 && approved.length > 1) {
    for (let i = 1; i < approved.length; i++) {
      connections.push({ from: 0, to: i, id: `0-${i}` });
    }
  }

  return (
    <div className="glass-card-static p-6">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-4">Network Topology</p>
      <div className="flex justify-center overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[600px]" style={{ maxHeight: 280 }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connection lines */}
          {connections.map((conn) => {
            const from = positions[conn.from];
            const to = positions[conn.to];
            const pathId = `path-${conn.id}`;
            return (
              <g key={conn.id}>
                <path
                  id={pathId}
                  d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                  stroke="rgba(52, 211, 153, 0.12)"
                  strokeWidth="1"
                  strokeDasharray="6 4"
                  fill="none"
                />
                {/* Animated dot */}
                <circle r="2.5" fill="#34d399" filter="url(#glow)">
                  <animateMotion dur="3s" repeatCount="indefinite">
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
                <circle r="2.5" fill="#34d399" opacity="0.5" filter="url(#glow)">
                  <animateMotion dur="3s" repeatCount="indefinite" begin="1.5s">
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
              </g>
            );
          })}

          {/* Device nodes */}
          {approved.map((device, i) => {
            const pos = positions[i];
            const online = isOnline(device.last_active);
            return (
              <g key={device.device_id}>
                {/* Node background */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="28"
                  fill="rgba(17, 24, 39, 0.8)"
                  stroke={online ? "rgba(52, 211, 153, 0.3)" : "rgba(255, 255, 255, 0.06)"}
                  strokeWidth="1"
                />
                {/* Online indicator */}
                <circle
                  cx={pos.x + 20}
                  cy={pos.y - 20}
                  r="4"
                  fill={online ? "#34d399" : "#4b5563"}
                />
                {online && (
                  <circle
                    cx={pos.x + 20}
                    cy={pos.y - 20}
                    r="4"
                    fill="#34d399"
                    opacity="0.5"
                  >
                    <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Device icon placeholder - using foreignObject for React icons */}
                <foreignObject x={pos.x - 12} y={pos.y - 12} width="24" height="24">
                  <div className="flex items-center justify-center w-full h-full">
                    <DeviceIconSvg type={device.device_type} />
                  </div>
                </foreignObject>
                {/* Label */}
                <text
                  x={pos.x}
                  y={pos.y + 42}
                  textAnchor="middle"
                  className="text-[11px] fill-gray-500"
                >
                  {device.name.length > 12 ? device.name.slice(0, 12) + "..." : device.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

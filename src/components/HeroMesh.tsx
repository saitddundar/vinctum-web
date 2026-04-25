export default function HeroMesh() {
  const lines: [string, string][] = [
    ["M240,160 L120,80", "a"],
    ["M240,160 L380,90", "b"],
    ["M240,160 L100,230", "c"],
    ["M240,160 L360,240", "d"],
    ["M120,80 L380,90", "e"],
    ["M100,230 L360,240", "f"],
  ];
  const nodes = [
    { x: 240, y: 160, r: 32, label: "MacBook", sub: "sender", me: true },
    { x: 120, y: 80, r: 24, label: "iPhone", sub: "online", me: false },
    { x: 380, y: 90, r: 24, label: "Linux", sub: "online", me: false },
    { x: 100, y: 230, r: 22, label: "iPad", sub: "online", me: false },
    { x: 360, y: 240, r: 22, label: "NAS", sub: "relaying", me: false },
  ];

  return (
    <div className="rounded-xl border border-gray-800/60 bg-gray-900/80 p-5 shadow-[0_40px_80px_rgba(0,0,0,.4)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-gray-400 tracking-wide">mesh.vinctum</span>
        </div>
        <span className="font-mono text-[10px] text-gray-600">247ms · p95</span>
      </div>

      {/* SVG Mesh */}
      <div className="relative rounded-lg border border-gray-800/60 bg-gray-950/60 overflow-hidden" style={{ height: 320 }}>
        <svg width="100%" height="100%" viewBox="0 0 480 320" className="absolute inset-0">
          <defs>
            <radialGradient id="ng" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </radialGradient>
            <filter id="sg"><feGaussianBlur stdDeviation="3" /></filter>
          </defs>

          {lines.map(([d, id], i) => (
            <g key={id}>
              <path id={`hp-${id}`} d={d} stroke="rgba(52,211,153,0.12)" strokeWidth="1" strokeDasharray="6 4" fill="none" />
              <circle r="2" fill="#34d399" opacity="0.9">
                <animateMotion dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" begin={`${i * 0.4}s`}>
                  <mpath href={`#hp-${id}`} />
                </animateMotion>
              </circle>
            </g>
          ))}

          {nodes.map((n, i) => (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={n.r + 12} fill="url(#ng)" />
              <circle cx={n.x} cy={n.y} r={n.r} fill={n.me ? "rgba(17,24,39,0.9)" : "rgba(17,24,39,0.7)"} stroke={n.me ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.06)"} strokeWidth="1" />
              {n.me && (
                <circle cx={n.x} cy={n.y} r={n.r + 2} fill="none" stroke="#34d399" strokeOpacity="0.4" strokeDasharray="3 4">
                  <animateTransform attributeName="transform" type="rotate" from={`0 ${n.x} ${n.y}`} to={`360 ${n.x} ${n.y}`} dur="12s" repeatCount="indefinite" />
                </circle>
              )}
              <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#e5e7eb" fontSize="10" fontFamily="monospace">
                {n.label.slice(0, 3).toLowerCase()}
              </text>
              <text x={n.x} y={n.y + n.r + 16} textAnchor="middle" fill="#9ca3af" fontSize="10">{n.label}</text>
              <text x={n.x} y={n.y + n.r + 28} textAnchor="middle" fill="#6b7280" fontSize="9" fontFamily="monospace">{n.sub}</text>
            </g>
          ))}
        </svg>
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-gray-950/85 border border-gray-800/60 text-[10px] text-gray-400 font-mono">
          <span className="text-emerald-400">●</span> 5 peers · 3 sessions
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-px mt-3 bg-gray-800/40 rounded-lg overflow-hidden">
        {([["UP", "48.2 MB/s", "text-emerald-400"], ["DOWN", "12.8 MB/s", "text-cyan-400"], ["ENCRYPT", "AES-GCM", "text-violet-400"]] as const).map(([k, v, c]) => (
          <div key={k} className="bg-gray-900/80 px-3 py-2.5">
            <div className="text-[9px] text-gray-600 uppercase tracking-widest">{k}</div>
            <div className={`font-mono text-[13px] font-medium mt-0.5 ${c}`}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

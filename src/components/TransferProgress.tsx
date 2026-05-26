import { Pause, Play, X } from "lucide-react";

interface TransferProgressProps {
  /** 0-100 */
  percent: number;
  /** File name to display */
  filename: string;
  /** Chunks sent / total label */
  chunksLabel?: string;
  /** Bytes label (e.g. "12.4 MB / 50 MB") */
  bytesLabel?: string;
  /** Whether the transfer is paused */
  paused?: boolean;
  /** Show pause/resume controls */
  showControls?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  /** Accent color for the ring */
  color?: string;
  /** Size of the circular ring in px */
  size?: number;
}

export default function TransferProgress({
  percent,
  filename,
  chunksLabel,
  bytesLabel,
  paused = false,
  showControls = false,
  onPause,
  onResume,
  onCancel,
  color = "var(--accent)",
  size = 96,
}: TransferProgressProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="glass-card-static" style={{ padding: 20, display: "flex", alignItems: "center", gap: 20 }}>
      {/* Circular progress ring */}
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg
          width={size}
          height={size}
          style={{
            transform: "rotate(-90deg)",
            animation: paused ? "none" : undefined,
          }}
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="oklch(1 0 0 / .07)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.4s ease",
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        {/* Center text */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span className="font-mono" style={{ fontSize: 18, fontWeight: 600, color: "var(--fg)", lineHeight: 1 }}>
            {Math.round(percent)}%
          </span>
          {paused && (
            <span style={{ fontSize: 9, color: "var(--amber)", marginTop: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>
              Paused
            </span>
          )}
        </div>
      </div>

      {/* Info + controls */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: "var(--fg)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {filename}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
          {chunksLabel && (
            <span className="font-mono" style={{ fontSize: 11, color: "var(--muted-2)" }}>{chunksLabel}</span>
          )}
          {bytesLabel && (
            <span className="font-mono" style={{ fontSize: 11, color: "var(--muted-2)" }}>{bytesLabel}</span>
          )}
        </div>

        {/* Controls */}
        {showControls && (
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            {paused ? (
              <button
                onClick={onResume}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8,
                  background: "oklch(0.78 0.15 160 / .1)", border: "1px solid oklch(0.78 0.15 160 / .25)",
                  color: "var(--accent)", fontSize: 11.5, fontWeight: 500, cursor: "pointer",
                }}
              >
                <Play size={12} /> Resume
              </button>
            ) : (
              <button
                onClick={onPause}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8,
                  background: "oklch(0.84 0.13 85 / .08)", border: "1px solid oklch(0.84 0.13 85 / .2)",
                  color: "var(--amber)", fontSize: 11.5, fontWeight: 500, cursor: "pointer",
                }}
              >
                <Pause size={12} /> Pause
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8,
                  background: "oklch(0.72 0.17 25 / .06)", border: "1px solid oklch(0.72 0.17 25 / .15)",
                  color: "var(--red)", fontSize: 11.5, fontWeight: 500, cursor: "pointer",
                }}
              >
                <X size={12} /> Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

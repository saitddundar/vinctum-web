import { useEffect, useState } from "react";
import { fetchMLHealth } from "../lib/ml-api";
import type { NodeMetrics, ScoreResponse } from "../types/api";

export default function Nodes() {
  const [mlOnline, setMlOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetchMLHealth().then(h => setMlOnline(h !== null));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>
            Network <span className="font-serif" style={{ color: "var(--accent)" }}>nodes</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 6, marginBottom: 0 }}>
            Node metrics and health scores as your mesh peers are discovered.
          </p>
        </div>
        {mlOnline !== null && (
          <div className="flex items-center gap-2">
            {mlOnline ? <span className="live-dot" /> : <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--muted-2)" }} />}
            <span style={{ fontSize: 12, color: "var(--fg-2)" }}>ML scoring {mlOnline ? "active" : "offline"}</span>
          </div>
        )}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "48px 32px", textAlign: "center", background: "oklch(1 0 0 / .01)" }}>
        <div style={{ fontSize: 13.5, color: "var(--fg-2)", lineHeight: 1.6, maxWidth: 440, margin: "0 auto" }}>
          Node metrics and scores will appear here as your network peers are discovered and transfers are routed through the mesh.
        </div>
        {!mlOnline && mlOnline !== null && (
          <div style={{ marginTop: 18, padding: "10px 16px", borderRadius: 9, background: "oklch(0.84 0.13 85 / .07)", border: "1px solid oklch(0.84 0.13 85 / .2)", display: "inline-block" }}>
            <span style={{ fontSize: 12.5, color: "var(--amber)" }}>ML service is offline — node scoring unavailable</span>
          </div>
        )}
      </div>
    </div>
  );
}

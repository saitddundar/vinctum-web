import { useEffect, useState } from "react";
import { fetchMLHealth } from "../lib/ml-api";

export default function Anomalies() {
  const [mlOnline, setMlOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetchMLHealth().then(h => setMlOnline(h !== null));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>
            Security <span className="font-serif" style={{ color: "var(--accent)" }}>events</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 6, marginBottom: 0 }}>
            Anomaly detection and security events for your mesh.
          </p>
        </div>
        {mlOnline !== null && (
          <div className="flex items-center gap-2">
            {mlOnline ? <span className="live-dot" /> : <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--muted-2)" }} />}
            <span style={{ fontSize: 12, color: "var(--fg-2)" }}>Detection {mlOnline ? "active" : "offline"}</span>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 4 }}>
        {[
          ["Anomalies detected", "0",   "var(--accent)"],
          ["Events (7d)",        "—",   "var(--fg)"],
          ["Threat score",       "Low", "var(--accent)"],
        ].map(([l,v,c]) => (
          <div key={l} className="flat-card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 10.5, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".09em", fontWeight: 600 }}>{l}</div>
            <div className="font-mono" style={{ fontSize: 22, color: c as string, marginTop: 8, letterSpacing: "-0.02em", fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "48px 32px", textAlign: "center", background: "oklch(1 0 0 / .01)" }}>
        <div style={{ fontSize: 13.5, color: "var(--fg-2)", lineHeight: 1.6, maxWidth: 440, margin: "0 auto" }}>
          No anomalies detected. When the ML service identifies unusual patterns in node behaviour — traffic spikes, route hijacking attempts, or failed auth bursts — they will appear here with severity and affected nodes.
        </div>
        {!mlOnline && mlOnline !== null && (
          <div style={{ marginTop: 18, padding: "10px 16px", borderRadius: 9, background: "oklch(0.84 0.13 85 / .07)", border: "1px solid oklch(0.84 0.13 85 / .2)", display: "inline-block" }}>
            <span style={{ fontSize: 12.5, color: "var(--amber)" }}>ML service is offline — anomaly detection unavailable</span>
          </div>
        )}
      </div>
    </div>
  );
}

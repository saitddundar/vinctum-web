import { useEffect, useState } from "react";
import { Shield, AlertTriangle, CheckCircle2, Loader2, RefreshCw, Activity } from "lucide-react";
import { toast } from "sonner";
import { fetchMLHealth, scanNodes } from "../lib/ml-api";
import type { NodeScanResult, ScanResponse } from "../lib/ml-api";
import type { HealthResponse } from "../types/api";

export default function Anomalies() {
  const [mlHealth, setMlHealth] = useState<HealthResponse | null>(null);
  const [mlOnline, setMlOnline] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [scanning, setScanning] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    fetchMLHealth().then(h => {
      setMlHealth(h);
      setMlOnline(h !== null);
      setInitialLoad(false);
    });
  }, []);

  async function handleScan() {
    setScanning(true);
    try {
      const result = await scanNodes();
      setScanResult(result);
      if (result.summary.anomalies > 0) {
        toast.warning(`${result.summary.anomalies} anomaly detected`);
      } else {
        toast.success("All nodes healthy");
      }
    } catch {
      toast.error("Scan failed — is the ML service running?");
    } finally {
      setScanning(false);
    }
  }

  const summary = scanResult?.summary;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>Security</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>ML-powered anomaly detection for your mesh nodes</p>
        </div>
        <div className="flex items-center gap-3">
          {mlOnline !== null && (
            <div className="flex items-center gap-2" style={{ padding: "5px 12px", borderRadius: 8, background: mlOnline ? "oklch(0.78 0.15 160 / .06)" : "oklch(0.84 0.13 85 / .06)", border: `1px solid ${mlOnline ? "oklch(0.78 0.15 160 / .15)" : "oklch(0.84 0.13 85 / .15)"}` }}>
              {mlOnline ? <span className="live-dot" /> : <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--amber)" }} />}
              <span style={{ fontSize: 11.5, color: mlOnline ? "var(--accent)" : "var(--amber)" }}>
                {mlOnline ? "ML active" : "ML offline"}
              </span>
            </div>
          )}
          <button
            onClick={handleScan}
            disabled={scanning || !mlOnline}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
              background: "oklch(0.78 0.15 160 / .1)", border: "1px solid oklch(0.78 0.15 160 / .25)",
              color: "var(--accent)", fontSize: 12.5, fontWeight: 500, cursor: scanning || !mlOnline ? "not-allowed" : "pointer",
              opacity: scanning || !mlOnline ? 0.5 : 1,
            }}
          >
            {scanning ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={13} />}
            {scanning ? "Scanning…" : "Run scan"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          ["Nodes", summary ? String(summary.total) : "—", "var(--fg)"],
          ["Scanned", summary ? String(summary.scanned) : "—", "var(--cyan)"],
          ["Anomalies", summary ? String(summary.anomalies) : "0", summary && summary.anomalies > 0 ? "var(--red)" : "var(--accent)"],
          ["Avg Score", summary ? (summary.avg_score * 100).toFixed(0) + "%" : "—", "var(--accent)"],
        ].map(([l, v, c]) => (
          <div key={l} className="flat-card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 10.5, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".09em", fontWeight: 600 }}>{l}</div>
            <div className="font-mono" style={{ fontSize: 22, color: c as string, marginTop: 8, letterSpacing: "-0.02em", fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* ML Health details */}
      {mlHealth && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          <HealthCard label="ML Version" value={mlHealth.version} />
          <HealthCard label="Route Scorer" value={mlHealth.models_loaded.route_scorer ? "Loaded" : "Not loaded"} ok={mlHealth.models_loaded.route_scorer} />
          <HealthCard label="Anomaly Detector" value={mlHealth.models_loaded.anomaly_detector ? "Loaded" : "Not loaded"} ok={mlHealth.models_loaded.anomaly_detector} />
        </div>
      )}

      {/* Node results */}
      {scanResult ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Node Analysis</div>
          {scanResult.nodes.length === 0 ? (
            <EmptyState message="No nodes found. Register and pair devices first." />
          ) : (
            scanResult.nodes.map(node => (
              <NodeCard key={node.node_id} node={node} />
            ))
          )}
        </div>
      ) : !initialLoad && (
        <EmptyState message={
          mlOnline
            ? "Click \"Run scan\" to analyze your nodes for anomalies using the ML service."
            : "ML service is offline — start it to enable anomaly detection."
        } />
      )}
    </div>
  );
}

function HealthCard({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div style={{ padding: "14px 16px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--panel)" }}>
      <div style={{ fontSize: 10.5, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div className="flex items-center gap-2">
        {ok !== undefined && (
          ok ? <CheckCircle2 size={12} style={{ color: "var(--accent)" }} /> : <AlertTriangle size={12} style={{ color: "var(--amber)" }} />
        )}
        <span style={{ fontSize: 13, color: "var(--fg-2)", fontWeight: 500 }}>{value}</span>
      </div>
    </div>
  );
}

function NodeCard({ node }: { node: NodeScanResult }) {
  const scorePercent = (node.score * 100).toFixed(0);
  const scoreColor = node.score >= 0.7 ? "var(--accent)" : node.score >= 0.4 ? "var(--amber)" : "var(--red)";

  return (
    <div style={{
      padding: "16px 20px", borderRadius: 12,
      background: "var(--panel)",
      border: `1px solid ${node.is_anomaly ? "oklch(0.72 0.17 25 / .25)" : "var(--line)"}`,
      display: "flex", alignItems: "center", gap: 16,
    }}>
      {/* Status icon */}
      <div style={{
        width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
        background: node.is_anomaly ? "oklch(0.72 0.17 25 / .1)" : "oklch(0.78 0.15 160 / .08)",
        border: `1px solid ${node.is_anomaly ? "oklch(0.72 0.17 25 / .2)" : "oklch(0.78 0.15 160 / .2)"}`,
      }}>
        {node.is_anomaly
          ? <AlertTriangle size={16} style={{ color: "var(--red)" }} />
          : <Shield size={16} style={{ color: "var(--accent)" }} />
        }
      </div>

      {/* Node info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-mono" style={{ fontSize: 12.5, color: "var(--fg)", fontWeight: 500 }}>
          {node.node_id.length > 16 ? node.node_id.slice(0, 8) + "…" + node.node_id.slice(-6) : node.node_id}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>
          {node.is_anomaly ? "Anomalous behaviour detected" : node.has_metrics ? "Healthy" : "No metrics collected yet"}
        </div>
      </div>

      {/* Score */}
      {node.has_metrics && (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".08em" }}>Score</div>
            <div className="font-mono" style={{ fontSize: 16, fontWeight: 600, color: scoreColor }}>{scorePercent}%</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".08em" }}>Confidence</div>
            <div className="font-mono" style={{ fontSize: 14, color: "var(--fg-2)" }}>{(node.confidence * 100).toFixed(0)}%</div>
          </div>
          {node.is_anomaly && (
            <div style={{ padding: "4px 10px", borderRadius: 6, background: "oklch(0.72 0.17 25 / .1)", fontSize: 11, fontWeight: 600, color: "var(--red)" }}>
              ANOMALY
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "48px 32px", textAlign: "center", background: "oklch(1 0 0 / .01)" }}>
      <Activity size={28} style={{ color: "var(--muted-2)", margin: "0 auto 14px" }} />
      <div style={{ fontSize: 13.5, color: "var(--fg-2)", lineHeight: 1.6, maxWidth: 440, margin: "0 auto" }}>
        {message}
      </div>
    </div>
  );
}

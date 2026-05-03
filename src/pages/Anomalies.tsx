import { useEffect, useState } from "react";
import { Shield, AlertTriangle, CheckCircle2, Loader2, RefreshCw, Activity, Wifi, Clock, Zap } from "lucide-react";
import { toast } from "sonner";
import { fetchMLHealth, scanNodes, fetchNodeMetrics } from "../lib/ml-api";
import type { NodeScanResult, ScanResponse, NodeMetricsData } from "../lib/ml-api";
import type { HealthResponse } from "../types/api";

type Tab = "overview" | "scan";

export default function Anomalies() {
  const [tab, setTab] = useState<Tab>("overview");
  const [mlHealth, setMlHealth] = useState<HealthResponse | null>(null);
  const [mlOnline, setMlOnline] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [metrics, setMetrics] = useState<NodeMetricsData[]>([]);
  const [scanning, setScanning] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    fetchMLHealth().then(h => {
      setMlHealth(h);
      setMlOnline(h !== null);
    });
    loadMetrics();
  }, []);

  async function loadMetrics() {
    setLoadingMetrics(true);
    try {
      const res = await fetchNodeMetrics();
      setMetrics(res.nodes || []);
    } catch {
      // no metrics available
    } finally {
      setLoadingMetrics(false);
    }
  }

  async function handleScan() {
    setScanning(true);
    try {
      const result = await scanNodes();
      setScanResult(result);
      setTab("scan");
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>Network</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>Node health, metrics, and ML-powered anomaly detection</p>
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

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: 4, background: "oklch(0.16 0.012 235)", borderRadius: 10, border: "1px solid var(--line)", width: "fit-content" }}>
        {([
          { key: "overview" as Tab, label: "Node Metrics" },
          { key: "scan" as Tab, label: "Security Scan" },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
              background: tab === t.key ? "oklch(0.78 0.15 160 / .1)" : "transparent",
              border: tab === t.key ? "1px solid oklch(0.78 0.15 160 / .2)" : "1px solid transparent",
              color: tab === t.key ? "var(--accent)" : "var(--muted)",
              transition: "all .15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "overview" ? (
        <MetricsTab metrics={metrics} loading={loadingMetrics} mlHealth={mlHealth} />
      ) : (
        <ScanTab scanResult={scanResult} mlOnline={mlOnline} />
      )}
    </div>
  );
}

/* ─── Metrics Tab ──────────────────────────────────────────── */
function MetricsTab({ metrics, loading, mlHealth }: { metrics: NodeMetricsData[]; loading: boolean; mlHealth: HealthResponse | null }) {
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <Loader2 size={22} style={{ color: "var(--accent)", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ML Health */}
      {mlHealth && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          <MiniCard label="ML Version" value={mlHealth.version} />
          <MiniCard label="Route Scorer" value={mlHealth.models_loaded.route_scorer ? "Loaded" : "—"} ok={mlHealth.models_loaded.route_scorer} />
          <MiniCard label="Anomaly Detector" value={mlHealth.models_loaded.anomaly_detector ? "Loaded" : "—"} ok={mlHealth.models_loaded.anomaly_detector} />
        </div>
      )}

      {/* Node list */}
      {metrics.length === 0 ? (
        <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "48px 32px", textAlign: "center", background: "oklch(1 0 0 / .01)" }}>
          <Wifi size={28} style={{ color: "var(--muted-2)", margin: "0 auto 14px" }} />
          <div style={{ fontSize: 13.5, color: "var(--fg-2)", lineHeight: 1.6, maxWidth: 440, margin: "0 auto" }}>
            No node metrics collected yet. Metrics accumulate as transfers are routed through your mesh.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Active Nodes ({metrics.length})</div>
          {metrics.map(m => (
            <NodeMetricsCard key={m.node_id} node={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function NodeMetricsCard({ node }: { node: NodeMetricsData }) {
  const uptimePercent = (node.uptime * 100).toFixed(1);
  const uptimeColor = node.uptime >= 0.95 ? "var(--accent)" : node.uptime >= 0.8 ? "var(--amber)" : "var(--red)";

  return (
    <div style={{ padding: "18px 20px", borderRadius: 12, background: "var(--panel)", border: "1px solid var(--line)" }}>
      {/* Node ID */}
      <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
        <div className="font-mono" style={{ fontSize: 12.5, fontWeight: 500, color: "var(--fg)" }}>
          {node.node_id.length > 20 ? node.node_id.slice(0, 8) + "…" + node.node_id.slice(-6) : node.node_id}
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 11, color: uptimeColor, fontWeight: 500 }}>{uptimePercent}% uptime</span>
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
        <MetricCell icon={Activity} label="Events" value={String(node.total_events)} />
        <MetricCell icon={CheckCircle2} label="Success" value={`${((1 - node.failure_rate) * 100).toFixed(0)}%`} color="var(--accent)" />
        <MetricCell icon={Clock} label="Avg Latency" value={`${node.avg_latency_ms.toFixed(0)}ms`} />
        <MetricCell icon={Zap} label="P95 Latency" value={`${node.p95_latency_ms.toFixed(0)}ms`} />
        <MetricCell icon={Wifi} label="Throughput" value={formatBytes(node.total_bytes)} />
      </div>

      {/* Progress bar for failure rate */}
      {node.total_events > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="flex justify-between" style={{ fontSize: 10.5, color: "var(--muted-2)", marginBottom: 4 }}>
            <span>Health</span>
            <span>{node.failures} failures / {node.total_events} events</span>
          </div>
          <div style={{ height: 3, borderRadius: 99, background: "oklch(1 0 0 / .06)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99, width: `${(1 - node.failure_rate) * 100}%`,
              background: node.failure_rate < 0.05 ? "var(--accent)" : node.failure_rate < 0.2 ? "var(--amber)" : "var(--red)",
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCell({ icon: Icon, label, value, color }: { icon: typeof Activity; label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1" style={{ fontSize: 10, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 }}>
        <Icon size={9} /> {label}
      </div>
      <div className="font-mono" style={{ fontSize: 13, fontWeight: 500, color: color || "var(--fg)", letterSpacing: "-0.01em" }}>{value}</div>
    </div>
  );
}

/* ─── Scan Tab ─────────────────────────────────────────────── */
function ScanTab({ scanResult, mlOnline }: { scanResult: ScanResponse | null; mlOnline: boolean | null }) {
  if (!scanResult) {
    return (
      <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "48px 32px", textAlign: "center", background: "oklch(1 0 0 / .01)" }}>
        <Activity size={28} style={{ color: "var(--muted-2)", margin: "0 auto 14px" }} />
        <div style={{ fontSize: 13.5, color: "var(--fg-2)", lineHeight: 1.6, maxWidth: 440, margin: "0 auto" }}>
          {mlOnline
            ? "Click \"Run scan\" to analyze your nodes for anomalies using the ML service."
            : "ML service is offline — start it to enable anomaly detection."}
        </div>
      </div>
    );
  }

  const { summary } = scanResult;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          ["Nodes", String(summary.total), "var(--fg)"],
          ["Scanned", String(summary.scanned), "var(--cyan)"],
          ["Anomalies", String(summary.anomalies), summary.anomalies > 0 ? "var(--red)" : "var(--accent)"],
          ["Avg Score", (summary.avg_score * 100).toFixed(0) + "%", "var(--accent)"],
        ].map(([l, v, c]) => (
          <div key={l} className="flat-card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 10.5, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".09em", fontWeight: 600 }}>{l}</div>
            <div className="font-mono" style={{ fontSize: 22, color: c as string, marginTop: 8, letterSpacing: "-0.02em", fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Node results */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Scan Results</div>
        {scanResult.nodes.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>No nodes found.</div>
        ) : (
          scanResult.nodes.map(node => (
            <ScanNodeCard key={node.node_id} node={node} />
          ))
        )}
      </div>
    </div>
  );
}

function ScanNodeCard({ node }: { node: NodeScanResult }) {
  const scorePercent = (node.score * 100).toFixed(0);
  const scoreColor = node.score >= 0.7 ? "var(--accent)" : node.score >= 0.4 ? "var(--amber)" : "var(--red)";

  return (
    <div style={{
      padding: "16px 20px", borderRadius: 12, background: "var(--panel)",
      border: `1px solid ${node.is_anomaly ? "oklch(0.72 0.17 25 / .25)" : "var(--line)"}`,
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
        background: node.is_anomaly ? "oklch(0.72 0.17 25 / .1)" : "oklch(0.78 0.15 160 / .08)",
        border: `1px solid ${node.is_anomaly ? "oklch(0.72 0.17 25 / .2)" : "oklch(0.78 0.15 160 / .2)"}`,
      }}>
        {node.is_anomaly
          ? <AlertTriangle size={16} style={{ color: "var(--red)" }} />
          : <Shield size={16} style={{ color: "var(--accent)" }} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-mono" style={{ fontSize: 12.5, color: "var(--fg)", fontWeight: 500 }}>
          {node.node_id.length > 16 ? node.node_id.slice(0, 8) + "…" + node.node_id.slice(-6) : node.node_id}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>
          {node.is_anomaly ? "Anomalous behaviour detected" : node.has_metrics ? "Healthy" : "No metrics yet"}
        </div>
      </div>

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

/* ─── Shared ───────────────────────────────────────────────── */
function MiniCard({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

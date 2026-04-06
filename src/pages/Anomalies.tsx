import { useState } from "react";
import { detectAnomaly } from "../lib/api";
import type { NodeMetrics, AnomalyResponse } from "../types/api";

const defaultMetrics: NodeMetrics = {
  total_events: 500,
  successes: 200,
  failures: 300,
  timeouts: 150,
  reroutes: 40,
  circuit_opens: 8,
  avg_latency_ms: 800,
  min_latency_ms: 50,
  max_latency_ms: 3000,
  p95_latency_ms: 2000,
  total_bytes: 50000,
  avg_bytes_per_op: 100,
  failure_rate: 0.6,
  uptime: 0.4,
};

export default function Anomalies() {
  const [nodeId, setNodeId] = useState("node-suspect");
  const [eventsPerMin, setEventsPerMin] = useState(15);
  const [metrics, setMetrics] = useState<NodeMetrics>(defaultMetrics);
  const [result, setResult] = useState<AnomalyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDetect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await detectAnomaly({
        node_id: nodeId,
        metrics,
        events_per_minute: eventsPerMin,
      });
      setResult(res);
    } catch {
      setError("Failed to detect anomaly");
    } finally {
      setLoading(false);
    }
  };

  const updateMetric = (key: keyof NodeMetrics, value: string) => {
    const num = Number(value);
    if (!isNaN(num)) {
      setMetrics((prev) => ({ ...prev, [key]: num }));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Anomaly Detection</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Node ID
              </label>
              <input
                type="text"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Events/min
              </label>
              <input
                type="number"
                value={eventsPerMin}
                onChange={(e) => setEventsPerMin(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">
                  {key}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) =>
                    updateMetric(key as keyof NodeMetrics, e.target.value)
                  }
                  step={key.includes("rate") || key === "uptime" ? 0.01 : 1}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleDetect}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded px-4 py-2 text-sm font-medium transition-colors"
          >
            {loading ? "Detecting..." : "Detect Anomaly"}
          </button>
        </div>

        {/* Result */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400 mb-4">Result</p>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {result && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Node</p>
                <p className="text-lg">{result.node_id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p
                  className={`text-3xl font-semibold ${
                    result.is_anomaly ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {result.is_anomaly ? "ANOMALY" : "NORMAL"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Anomaly Score</p>
                <div className="w-full bg-gray-800 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      result.anomaly_score > 0.7
                        ? "bg-red-500"
                        : result.anomaly_score > 0.4
                          ? "bg-yellow-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${result.anomaly_score * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {(result.anomaly_score * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {!result && !error && (
            <p className="text-gray-600 text-sm">
              Enter node metrics and click Detect
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

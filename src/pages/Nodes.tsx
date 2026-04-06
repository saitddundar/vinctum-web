import { useState } from "react";
import { scoreNode } from "../lib/api";
import type { NodeMetrics, ScoreResponse } from "../types/api";

const defaultMetrics: NodeMetrics = {
  total_events: 1000,
  successes: 950,
  failures: 50,
  timeouts: 10,
  reroutes: 5,
  circuit_opens: 1,
  avg_latency_ms: 45,
  min_latency_ms: 5,
  max_latency_ms: 200,
  p95_latency_ms: 120,
  total_bytes: 1024000,
  avg_bytes_per_op: 1024,
  failure_rate: 0.05,
  uptime: 0.95,
};

export default function Nodes() {
  const [nodeId, setNodeId] = useState("node-1");
  const [metrics, setMetrics] = useState<NodeMetrics>(defaultMetrics);
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await scoreNode({ node_id: nodeId, metrics });
      setResult(res);
    } catch {
      setError("Failed to score node");
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
      <h1 className="text-2xl font-semibold">Node Scoring</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Node ID</label>
            <input
              type="text"
              value={nodeId}
              onChange={(e) => setNodeId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
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
            onClick={handleScore}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded px-4 py-2 text-sm font-medium transition-colors"
          >
            {loading ? "Scoring..." : "Score Node"}
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
                <p className="text-xs text-gray-500">Quality Score</p>
                <p className="text-3xl font-semibold text-emerald-400">
                  {(result.score * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Confidence</p>
                <div className="w-full bg-gray-800 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {(result.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          )}

          {!result && !error && (
            <p className="text-gray-600 text-sm">
              Enter node metrics and click Score
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchNodes, fetchAnomalies } from "../lib/ml-api";
import type { MockNode, MockAnomaly } from "../lib/mock-data";

const severityColor = {
  critical: "bg-red-900/50 text-red-300 border-red-800",
  warning: "bg-yellow-900/50 text-yellow-300 border-yellow-800",
  info: "bg-blue-900/50 text-blue-300 border-blue-800",
};

const statusDot = {
  good: "bg-emerald-400",
  average: "bg-yellow-400",
  bad: "bg-red-400",
  unstable: "bg-orange-400",
};

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Dashboard() {
  const [nodes, setNodes] = useState<MockNode[]>([]);
  const [anomalies, setAnomalies] = useState<MockAnomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchNodes(), fetchAnomalies()])
      .then(([n, a]) => {
        setNodes(n);
        setAnomalies(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    if (!nodes.length) return null;
    const active = nodes.filter((n) => n.status !== "bad").length;
    const avgScore = nodes.reduce((s, n) => s + n.score, 0) / nodes.length;
    const criticalAnomalies = anomalies.filter((a) => a.severity === "critical").length;
    return {
      totalNodes: nodes.length,
      activeNodes: active,
      avgScore,
      totalAnomalies: anomalies.length,
      criticalAnomalies,
    };
  }, [nodes, anomalies]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-800 bg-gray-900 p-5 animate-pulse">
              <div className="h-3 bg-gray-800 rounded w-20 mb-3" />
              <div className="h-7 bg-gray-800 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Nodes" value={stats!.totalNodes} />
        <StatCard label="Active Nodes" value={stats!.activeNodes} accent="text-emerald-400" />
        <StatCard label="Avg Score" value={`${(stats!.avgScore * 100).toFixed(0)}%`} accent="text-blue-400" />
        <StatCard
          label="Anomalies"
          value={stats!.totalAnomalies}
          sub={`${stats!.criticalAnomalies} critical`}
          accent={stats!.criticalAnomalies > 0 ? "text-red-400" : "text-gray-300"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Anomalies */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-300">Recent Anomalies</p>
            <Link to="/anomalies" className="text-xs text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {anomalies.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                <span className={`text-xs px-2 py-0.5 rounded border ${severityColor[a.severity]}`}>
                  {a.severity}
                </span>
                <span className="text-sm text-gray-300 flex-1 truncate">{a.type}</span>
                <span className="text-xs text-gray-500">{a.nodeId}</span>
                <span className="text-xs text-gray-600">{timeAgo(a.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Node Overview */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-300">Node Overview</p>
            <Link to="/nodes" className="text-xs text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {nodes.slice(0, 6).map((n) => (
              <div key={n.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                <span className={`w-2 h-2 rounded-full ${statusDot[n.status]}`} />
                <span className="text-sm text-gray-300 flex-1">{n.id}</span>
                <span className="text-xs text-gray-500">{n.ip}</span>
                <span className={`text-sm font-medium ${n.score > 0.7 ? "text-emerald-400" : n.score > 0.4 ? "text-yellow-400" : "text-red-400"}`}>
                  {(n.score * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent = "text-white" }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

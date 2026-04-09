import { useEffect, useState } from "react";
import { fetchAnomalies } from "../lib/ml-api";
import type { MockAnomaly } from "../lib/mock-data";

const severityBadge = {
  critical: "bg-red-900/50 text-red-300 border-red-800",
  warning: "bg-yellow-900/50 text-yellow-300 border-yellow-800",
  info: "bg-blue-900/50 text-blue-300 border-blue-800",
};

const severityDot = {
  critical: "bg-red-400",
  warning: "bg-yellow-400",
  info: "bg-blue-400",
};

type SeverityFilter = "all" | "critical" | "warning" | "info";

function formatTime(iso: string) {
  const d = new Date(iso);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState<MockAnomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SeverityFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAnomalies()
      .then(setAnomalies)
      .finally(() => setLoading(false));
  }, []);

  const filtered = anomalies
    .filter((a) => filter === "all" || a.severity === filter)
    .filter(
      (a) =>
        !search ||
        a.nodeId.toLowerCase().includes(search.toLowerCase()) ||
        a.type.toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    all: anomalies.length,
    critical: anomalies.filter((a) => a.severity === "critical").length,
    warning: anomalies.filter((a) => a.severity === "warning").length,
    info: anomalies.filter((a) => a.severity === "info").length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Anomalies</h1>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-gray-900 border border-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Anomalies</h1>
        <span className="text-sm text-gray-500">{filtered.length} events</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Critical" count={counts.critical} color="text-red-400" dot="bg-red-400" />
        <SummaryCard label="Warning" count={counts.warning} color="text-yellow-400" dot="bg-yellow-400" />
        <SummaryCard label="Info" count={counts.info} color="text-blue-400" dot="bg-blue-400" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          {(["all", "critical", "warning", "info"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                filter === s
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {s !== "all" && <span className={`w-1.5 h-1.5 rounded-full ${severityDot[s]}`} />}
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="text-gray-600 ml-0.5">{counts[s]}</span>
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search node or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 w-56"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs">
              <th className="text-left px-4 py-3 font-medium">Severity</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Node</th>
              <th className="text-right px-4 py-3 font-medium">Score</th>
              <th className="text-right px-4 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded border ${severityBadge[a.severity]}`}>
                    {a.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-200">{a.type}</td>
                <td className="px-4 py-3">
                  <div>
                    <span className="text-gray-300">{a.nodeId}</span>
                    <span className="text-gray-600 text-xs ml-2 font-mono">{a.nodeIp}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-medium ${a.score > 0.7 ? "text-red-400" : a.score > 0.4 ? "text-yellow-400" : "text-blue-400"}`}>
                    {(a.score * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-500 text-xs">{formatTime(a.timestamp)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-600 text-sm">
                  No anomalies found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, count, color, dot }: { label: string; count: number; color: string; dot: string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className={`text-xl font-semibold ${color}`}>{count}</p>
    </div>
  );
}

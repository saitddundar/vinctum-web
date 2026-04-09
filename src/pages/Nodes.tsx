import { useEffect, useState } from "react";
import { fetchNodes } from "../lib/ml-api";
import type { MockNode } from "../lib/mock-data";

const statusBadge = {
  good: "bg-emerald-900/50 text-emerald-300 border-emerald-800",
  average: "bg-yellow-900/50 text-yellow-300 border-yellow-800",
  bad: "bg-red-900/50 text-red-300 border-red-800",
  unstable: "bg-orange-900/50 text-orange-300 border-orange-800",
};

type SortKey = "score" | "status" | "avgLatency" | "lastSeen";

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function Nodes() {
  const [nodes, setNodes] = useState<MockNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | MockNode["status"]>("all");
  const [sortBy, setSortBy] = useState<SortKey>("score");
  const [selected, setSelected] = useState<MockNode | null>(null);

  useEffect(() => {
    fetchNodes()
      .then(setNodes)
      .finally(() => setLoading(false));
  }, []);

  const statusOrder = { good: 0, average: 1, unstable: 2, bad: 3 };

  const filtered = nodes
    .filter((n) => filter === "all" || n.status === filter)
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "status") return statusOrder[a.status] - statusOrder[b.status];
      if (sortBy === "avgLatency") return a.avgLatency - b.avgLatency;
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
    });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Nodes</h1>
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
        <h1 className="text-2xl font-semibold">Nodes</h1>
        <span className="text-sm text-gray-500">{filtered.length} nodes</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          {(["all", "good", "average", "bad", "unstable"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === s
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
        >
          <option value="score">Sort by Score</option>
          <option value="status">Sort by Status</option>
          <option value="avgLatency">Sort by Latency</option>
          <option value="lastSeen">Sort by Last Seen</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs">
                <th className="text-left px-4 py-3 font-medium">Node</th>
                <th className="text-left px-4 py-3 font-medium">IP</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Score</th>
                <th className="text-right px-4 py-3 font-medium">Latency</th>
                <th className="text-right px-4 py-3 font-medium">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((node) => (
                <tr
                  key={node.id}
                  onClick={() => setSelected(node)}
                  className={`border-b border-gray-800/50 cursor-pointer transition-colors ${
                    selected?.id === node.id
                      ? "bg-gray-800/50"
                      : "hover:bg-gray-800/30"
                  }`}
                >
                  <td className="px-4 py-3 text-gray-200">{node.id}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{node.ip}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${statusBadge[node.status]}`}>
                      {node.status}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${node.score > 0.7 ? "text-emerald-400" : node.score > 0.4 ? "text-yellow-400" : "text-red-400"}`}>
                    {(node.score * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">{node.avgLatency}ms</td>
                  <td className="px-4 py-3 text-right text-gray-500 text-xs">{timeAgo(node.lastSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-72 rounded-lg border border-gray-800 bg-gray-900 p-5 space-y-4 shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">{selected.id}</p>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-300 text-xs">
                Close
              </button>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded border ${statusBadge[selected.status]}`}>
              {selected.status}
            </span>

            <div className="space-y-3 pt-2">
              <DetailRow label="IP" value={selected.ip} />
              <DetailRow label="Score" value={`${(selected.score * 100).toFixed(1)}%`} />
              <DetailRow label="Confidence" value={`${(selected.confidence * 100).toFixed(0)}%`} />
              <DetailRow label="Avg Latency" value={`${selected.avgLatency}ms`} />
              <DetailRow label="Uptime" value={`${(selected.uptime * 100).toFixed(1)}%`} />
              <DetailRow label="Failure Rate" value={`${(selected.failureRate * 100).toFixed(1)}%`} />
              <DetailRow label="Total Events" value={selected.totalEvents.toLocaleString()} />
              <DetailRow label="Last Seen" value={timeAgo(selected.lastSeen)} />
            </div>

            {/* Mini score bar */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Quality Score</p>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${selected.score > 0.7 ? "bg-emerald-500" : selected.score > 0.4 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${selected.score * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}

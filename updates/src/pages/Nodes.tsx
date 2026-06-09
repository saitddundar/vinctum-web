import { useEffect, useState } from "react";
import { fetchMLHealth } from "../lib/ml-api";

export default function Nodes() {
  const [mlOnline, setMlOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetchMLHealth().then((h) => setMlOnline(h !== null));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-gray-100">Nodes</h1>
        {mlOnline !== null && (
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${mlOnline ? "bg-emerald-400" : "bg-gray-600"}`} />
            <span className="text-xs text-gray-500">ML {mlOnline ? "online" : "offline"}</span>
          </div>
        )}
      </div>

      <div className="rounded-md border border-gray-800/40 bg-gray-900/30 p-12 text-center">
        <div className="max-w-sm mx-auto">
          <p className="text-gray-400">No node data available</p>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            Node metrics and scores will appear here as your network peers are discovered
            and transfers are routed through the mesh.
          </p>
        </div>
      </div>
    </div>
  );
}

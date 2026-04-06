import { useEffect, useState } from "react";
import { getHealth } from "../lib/api";
import type { HealthResponse } from "../types/api";

export default function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setError("ML API is not reachable"));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* API Status */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400 mb-1">API Status</p>
          {error ? (
            <p className="text-red-400 text-lg font-medium">Offline</p>
          ) : health ? (
            <p className="text-emerald-400 text-lg font-medium">
              {health.status}
            </p>
          ) : (
            <p className="text-gray-500 text-lg">Loading...</p>
          )}
        </div>

        {/* Route Scorer */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400 mb-1">Route Scorer</p>
          <p
            className={`text-lg font-medium ${
              health?.models_loaded.route_scorer
                ? "text-emerald-400"
                : "text-gray-500"
            }`}
          >
            {health?.models_loaded.route_scorer ? "Loaded" : "Not loaded"}
          </p>
        </div>

        {/* Anomaly Detector */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400 mb-1">Anomaly Detector</p>
          <p
            className={`text-lg font-medium ${
              health?.models_loaded.anomaly_detector
                ? "text-emerald-400"
                : "text-gray-500"
            }`}
          >
            {health?.models_loaded.anomaly_detector ? "Loaded" : "Not loaded"}
          </p>
        </div>
      </div>

      {health && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400 mb-2">System Info</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-gray-400">Version</span>
            <span>{health.version}</span>
            <span className="text-gray-400">Uptime</span>
            <span>{Math.round(health.uptime_seconds)}s</span>
          </div>
        </div>
      )}
    </div>
  );
}

import api, { getHealth } from "./api";
import type { HealthResponse } from "../types/api";

export async function fetchMLHealth(): Promise<HealthResponse | null> {
  try {
    return await getHealth();
  } catch {
    return null;
  }
}

export interface NodeScanResult {
  node_id: string;
  score: number;
  confidence: number;
  is_anomaly: boolean;
  anomaly_score: number;
  has_metrics: boolean;
}

export interface ScanResponse {
  nodes: NodeScanResult[];
  summary: {
    total: number;
    anomalies: number;
    avg_score: number;
    scanned: number;
  };
}

export async function scanNodes(): Promise<ScanResponse> {
  const { data } = await api.post("/v1/nodes/scan");
  return data;
}

export interface NodeMetricsData {
  node_id: string;
  total_events: number;
  successes: number;
  failures: number;
  timeouts: number;
  reroutes: number;
  circuit_opens: number;
  avg_latency_ms: number;
  min_latency_ms: number;
  max_latency_ms: number;
  p95_latency_ms: number;
  total_bytes: number;
  avg_bytes_per_op: number;
  failure_rate: number;
  uptime: number;
}

export async function fetchNodeMetrics(): Promise<{ nodes: NodeMetricsData[] }> {
  const { data } = await api.get("/v1/nodes/metrics");
  return data;
}


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


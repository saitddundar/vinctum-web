export interface NodeMetrics {
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

export interface ScoreRequest {
  node_id: string;
  metrics: NodeMetrics;
}

export interface ScoreResponse {
  node_id: string;
  score: number;
  confidence: number;
}

export interface AnomalyRequest {
  node_id: string;
  metrics: NodeMetrics;
  events_per_minute: number;
}

export interface AnomalyResponse {
  node_id: string;
  is_anomaly: boolean;
  anomaly_score: number;
}

export interface RouteRequest {
  nodes: ScoreRequest[];
}

export interface RouteResponse {
  scores: ScoreResponse[];
  best_node: string;
  route_score: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  uptime_seconds: number;
  models_loaded: Record<string, boolean>;
}

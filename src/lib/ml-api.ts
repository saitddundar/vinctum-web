import { scoreNode, detectAnomaly, getHealth } from "./api";
import { generateMockNodes, generateMockAnomalies } from "./mock-data";
import type { MockNode, MockAnomaly } from "./mock-data";
import type { ScoreResponse, AnomalyResponse, HealthResponse } from "../types/api";

const MOCK = true;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchNodes(): Promise<MockNode[]> {
  if (MOCK) {
    await delay(400);
    return generateMockNodes();
  }

  const nodes = generateMockNodes();

  const scored = await Promise.allSettled(
    nodes.map((node) =>
      scoreNode({
        node_id: node.id,
        metrics: {
          total_events: node.totalEvents,
          successes: Math.round(node.totalEvents * (1 - node.failureRate)),
          failures: Math.round(node.totalEvents * node.failureRate),
          timeouts: Math.round(node.totalEvents * node.failureRate * 0.3),
          reroutes: Math.floor(Math.random() * 10),
          circuit_opens: Math.floor(Math.random() * 3),
          avg_latency_ms: node.avgLatency,
          min_latency_ms: node.avgLatency * 0.3,
          max_latency_ms: node.avgLatency * 3,
          p95_latency_ms: node.avgLatency * 2,
          total_bytes: node.totalEvents * 1024,
          avg_bytes_per_op: 1024,
          failure_rate: node.failureRate,
          uptime: node.uptime,
        },
      })
    )
  );

  return nodes.map((node, i) => {
    const result = scored[i];
    if (result.status === "fulfilled") {
      const resp = result.value as ScoreResponse;
      const score = resp.score;
      return {
        ...node,
        score,
        confidence: resp.confidence,
        status: score > 0.75 ? "good" : score > 0.5 ? "average" : score > 0.3 ? "bad" : "unstable",
      } as MockNode;
    }
    return node;
  });
}

export async function fetchAnomalies(): Promise<MockAnomaly[]> {
  if (MOCK) {
    await delay(400);
    return generateMockAnomalies();
  }

  const nodes = generateMockNodes();

  const results = await Promise.allSettled(
    nodes.map((node) =>
      detectAnomaly({
        node_id: node.id,
        metrics: {
          total_events: node.totalEvents,
          successes: Math.round(node.totalEvents * (1 - node.failureRate)),
          failures: Math.round(node.totalEvents * node.failureRate),
          timeouts: Math.round(node.totalEvents * node.failureRate * 0.3),
          reroutes: Math.floor(Math.random() * 10),
          circuit_opens: Math.floor(Math.random() * 3),
          avg_latency_ms: node.avgLatency,
          min_latency_ms: node.avgLatency * 0.3,
          max_latency_ms: node.avgLatency * 3,
          p95_latency_ms: node.avgLatency * 2,
          total_bytes: node.totalEvents * 1024,
          avg_bytes_per_op: 1024,
          failure_rate: node.failureRate,
          uptime: node.uptime,
        },
        events_per_minute: node.totalEvents / 10,
      })
    )
  );

  const anomalies: MockAnomaly[] = [];
  const typeMap: Record<string, string> = {
    good: "Bandwidth Anomaly",
    average: "High Latency Spike",
    bad: "Excessive Failures",
    unstable: "Circuit Breaker Open",
  };

  nodes.forEach((node, i) => {
    const result = results[i];
    if (result.status !== "fulfilled") return;
    const resp = result.value as AnomalyResponse;
    if (!resp.is_anomaly) return;

    const severity =
      resp.anomaly_score > 0.7 ? "critical" : resp.anomaly_score > 0.4 ? "warning" : "info";

    anomalies.push({
      id: `anomaly-${anomalies.length + 1}`,
      nodeId: node.id,
      nodeIp: node.ip,
      type: typeMap[node.status] || "Unknown Anomaly",
      severity,
      score: resp.anomaly_score,
      timestamp: new Date().toISOString(),
      description: `ML detected anomaly on ${node.id} with score ${(resp.anomaly_score * 100).toFixed(0)}%`,
    });
  });

  return anomalies.sort((a, b) => b.score - a.score);
}

export async function fetchMLHealth(): Promise<HealthResponse | null> {
  if (MOCK) {
    await delay(200);
    return {
      status: "ok",
      version: "0.1.0",
      uptime_seconds: 3600,
      models_loaded: { route_scorer: true, anomaly_detector: true },
    };
  }

  try {
    return await getHealth();
  } catch {
    return null;
  }
}

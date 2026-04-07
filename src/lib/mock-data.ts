export interface MockNode {
  id: string;
  ip: string;
  score: number;
  confidence: number;
  status: "good" | "average" | "bad" | "unstable";
  lastSeen: string;
  totalEvents: number;
  avgLatency: number;
  uptime: number;
  failureRate: number;
}

export interface MockAnomaly {
  id: string;
  nodeId: string;
  nodeIp: string;
  type: string;
  severity: "critical" | "warning" | "info";
  score: number;
  timestamp: string;
  description: string;
}

function randomBetween(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomStatus(): MockNode["status"] {
  const r = Math.random();
  if (r > 0.6) return "good";
  if (r > 0.3) return "average";
  if (r > 0.1) return "bad";
  return "unstable";
}

function minutesAgo(min: number) {
  return new Date(Date.now() - min * 60000).toISOString();
}

const nodeNames = [
  "node-eu-west-1",
  "node-us-east-1",
  "node-us-west-2",
  "node-ap-south-1",
  "node-eu-central-1",
  "node-sa-east-1",
  "node-ap-northeast-1",
  "node-ca-central-1",
  "node-eu-north-1",
  "node-af-south-1",
  "node-me-south-1",
  "node-ap-southeast-2",
];

const anomalyTypes = [
  "High Latency Spike",
  "Excessive Failures",
  "Circuit Breaker Open",
  "Timeout Storm",
  "Bandwidth Anomaly",
  "Connection Drop",
];

export function generateMockNodes(): MockNode[] {
  return nodeNames.map((name, i) => {
    const status = randomStatus();
    const score =
      status === "good"
        ? randomBetween(0.75, 0.98)
        : status === "average"
          ? randomBetween(0.5, 0.74)
          : status === "bad"
            ? randomBetween(0.2, 0.49)
            : randomBetween(0.1, 0.6);
    return {
      id: name,
      ip: `10.${Math.floor(i / 4)}.${i}.${Math.floor(Math.random() * 254) + 1}`,
      score,
      confidence: randomBetween(0.7, 0.99),
      status,
      lastSeen: minutesAgo(Math.floor(Math.random() * 60)),
      totalEvents: Math.floor(randomBetween(500, 50000)),
      avgLatency: Math.round(
        status === "good"
          ? randomBetween(10, 60)
          : status === "bad"
            ? randomBetween(300, 1200)
            : randomBetween(50, 300)
      ),
      uptime: status === "good" ? randomBetween(0.95, 0.999) : randomBetween(0.3, 0.94),
      failureRate:
        status === "good"
          ? randomBetween(0.01, 0.05)
          : status === "bad"
            ? randomBetween(0.3, 0.7)
            : randomBetween(0.05, 0.3),
    };
  });
}

export function generateMockAnomalies(): MockAnomaly[] {
  const anomalies: MockAnomaly[] = [];
  for (let i = 0; i < 20; i++) {
    const node = nodeNames[Math.floor(Math.random() * nodeNames.length)];
    const severity: MockAnomaly["severity"] =
      Math.random() > 0.6 ? "critical" : Math.random() > 0.4 ? "warning" : "info";
    anomalies.push({
      id: `anomaly-${i + 1}`,
      nodeId: node,
      nodeIp: `10.${Math.floor(Math.random() * 4)}.${Math.floor(Math.random() * 12)}.${Math.floor(Math.random() * 254) + 1}`,
      type: anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)],
      severity,
      score: severity === "critical" ? randomBetween(0.75, 0.99) : severity === "warning" ? randomBetween(0.45, 0.74) : randomBetween(0.1, 0.44),
      timestamp: minutesAgo(Math.floor(Math.random() * 1440)),
      description: `Detected ${anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)].toLowerCase()} on ${node}`,
    });
  }
  return anomalies.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

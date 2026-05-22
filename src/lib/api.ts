import axios from "axios";
import type {
  HealthResponse,
  ScoreRequest,
  ScoreResponse,
  AnomalyRequest,
  AnomalyResponse,
  RouteRequest,
  RouteResponse,
} from "../types/api";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await api.get("/v1/ml/health");
  return data;
}

export async function scoreNode(req: ScoreRequest): Promise<ScoreResponse> {
  const { data } = await api.post("/v1/ml/score", req);
  return data;
}

export async function detectAnomaly(
  req: AnomalyRequest
): Promise<AnomalyResponse> {
  const { data } = await api.post("/v1/ml/anomaly", req);
  return data;
}

export async function scoreRoute(req: RouteRequest): Promise<RouteResponse> {
  const { data } = await api.post("/v1/ml/route", req);
  return data;
}

export interface PlatformStats {
  total_users: number;
  total_devices: number;
  total_transfers: number;
  total_bytes: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const { data } = await api.get("/v1/stats");
  return data;
}

export default api;

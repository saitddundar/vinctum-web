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
  const { data } = await api.get("/health");
  return data;
}

export async function scoreNode(req: ScoreRequest): Promise<ScoreResponse> {
  const { data } = await api.post("/score", req);
  return data;
}

export async function detectAnomaly(
  req: AnomalyRequest
): Promise<AnomalyResponse> {
  const { data } = await api.post("/anomaly", req);
  return data;
}

export async function scoreRoute(req: RouteRequest): Promise<RouteResponse> {
  const { data } = await api.post("/route", req);
  return data;
}

export default api;

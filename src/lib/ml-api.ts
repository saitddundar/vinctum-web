import { getHealth } from "./api";
import type { HealthResponse } from "../types/api";

export async function fetchMLHealth(): Promise<HealthResponse | null> {
  try {
    return await getHealth();
  } catch {
    return null;
  }
}

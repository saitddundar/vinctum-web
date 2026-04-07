import api from "./api";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
} from "../types/auth";

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post("/v1/auth/login", req);
  return data;
}

export async function register(req: RegisterRequest): Promise<RegisterResponse> {
  const { data } = await api.post("/v1/auth/register", req);
  return data;
}

export async function refreshToken(refreshToken: string): Promise<RefreshResponse> {
  const { data } = await api.post("/v1/auth/refresh", { refresh_token: refreshToken });
  return data;
}

export async function verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post("/v1/auth/verify", { token });
  return data;
}

export async function resendVerification(email: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post("/v1/auth/resend-verification", { email });
  return data;
}

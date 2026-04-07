import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
} from "../types/auth";

const MOCK = true;

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

const mockUser = {
  id: "mock-user-1",
  username: "testuser",
  email: "test@vinctum.app",
  email_verified: true,
};

export async function login(req: LoginRequest): Promise<LoginResponse> {
  if (MOCK) {
    await delay();
    if (req.email === "test@vinctum.app" && req.password === "12345678") {
      return {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        user: mockUser,
      };
    }
    throw { response: { data: { error: "Invalid email or password" } } };
  }
  const { default: api } = await import("./api");
  const { data } = await api.post("/v1/auth/login", req);
  return data;
}

export async function register(req: RegisterRequest): Promise<RegisterResponse> {
  if (MOCK) {
    await delay();
    return { message: "Verification email sent" };
  }
  const { default: api } = await import("./api");
  const { data } = await api.post("/v1/auth/register", req);
  return data;
}

export async function refreshToken(token: string): Promise<RefreshResponse> {
  if (MOCK) {
    await delay();
    return {
      access_token: "mock-access-token-new",
      refresh_token: "mock-refresh-token-new",
    };
  }
  const { default: api } = await import("./api");
  const { data } = await api.post("/v1/auth/refresh", { refresh_token: token });
  return data;
}

export async function verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
  if (MOCK) {
    await delay();
    return { success: true, message: "Email verified successfully!" };
  }
  const { default: api } = await import("./api");
  const { data } = await api.post("/v1/auth/verify", { token });
  return data;
}

export async function resendVerification(email: string): Promise<{ success: boolean; message: string }> {
  if (MOCK) {
    await delay();
    return { success: true, message: "Verification email resent" };
  }
  const { default: api } = await import("./api");
  const { data } = await api.post("/v1/auth/resend-verification", { email });
  return data;
}

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import api from "../lib/api";
import * as authApi from "../lib/auth-api";
import type { User, LoginRequest, RegisterRequest } from "../types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (req: LoginRequest) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEYS = {
  accessToken: "vinctum_access_token",
  refreshToken: "vinctum_refresh_token",
  user: "vinctum_user",
} as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    loading: true,
  });

  // Restore session from localStorage on mount
  useEffect(() => {
    const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
    const userJson = localStorage.getItem(STORAGE_KEYS.user);

    if (accessToken && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        setState({ user, accessToken, loading: false });
      } catch {
        clearStorage();
        setState({ user: null, accessToken: null, loading: false });
      }
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  // Axios interceptor: attach Bearer token to every request
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      const token = localStorage.getItem(STORAGE_KEYS.accessToken);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    const responseInterceptor = api.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;
          const refresh = localStorage.getItem(STORAGE_KEYS.refreshToken);
          if (refresh) {
            try {
              const data = await authApi.refreshToken(refresh);
              localStorage.setItem(STORAGE_KEYS.accessToken, data.access_token);
              localStorage.setItem(STORAGE_KEYS.refreshToken, data.refresh_token);
              setState((s) => ({ ...s, accessToken: data.access_token }));
              original.headers.Authorization = `Bearer ${data.access_token}`;
              return api(original);
            } catch {
              clearStorage();
              setState({ user: null, accessToken: null, loading: false });
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = useCallback(async (req: LoginRequest) => {
    const data = await authApi.login(req);
    localStorage.setItem(STORAGE_KEYS.accessToken, data.access_token);
    localStorage.setItem(STORAGE_KEYS.refreshToken, data.refresh_token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
    setState({ user: data.user, accessToken: data.access_token, loading: false });
  }, []);

  const register = useCallback(async (req: RegisterRequest) => {
    await authApi.register(req);
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    setState({ user: null, accessToken: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.user);
}

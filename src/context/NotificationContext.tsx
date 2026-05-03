import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getNotificationCount } from "../lib/friend-api";
import type { NotificationCount } from "../types/friend";

interface NotificationContextValue {
  counts: NotificationCount;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [counts, setCounts] = useState<NotificationCount>({
    friend_requests: 0,
    incoming_transfers: 0,
    total: 0,
  });

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getNotificationCount();
      setCounts(data);
    } catch {
      // silent
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    refresh();
    const interval = setInterval(refresh, 15_000);
    return () => clearInterval(interval);
  }, [user, refresh]);

  return (
    <NotificationContext.Provider value={{ counts, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider");
  return ctx;
}

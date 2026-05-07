import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { toast } from "sonner";
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
  const prevFR = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getNotificationCount();
      // Toast when friend_requests increases (skip initial load)
      if (prevFR.current !== null && data.friend_requests > prevFR.current) {
        const diff = data.friend_requests - prevFR.current;
        toast(`${diff} new friend request${diff > 1 ? "s" : ""}`, {
          action: {
            label: "View",
            onClick: () => { window.location.href = "/friends?tab=requests"; },
          },
        });
      }
      prevFR.current = data.friend_requests;
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

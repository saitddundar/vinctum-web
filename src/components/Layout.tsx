import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Monitor, Users, Send, Menu, X, LogOut, UserPlus, Inbox, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { registerDevice } from "../lib/device-api";
import { getDeviceFingerprint, guessDeviceType } from "../lib/fingerprint";
import { toProtoDeviceType } from "../types/device";
import { ensureDeviceKeys } from "../lib/device-key";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/devices", label: "Devices", icon: Monitor },
  { to: "/sessions", label: "Sessions", icon: Users },
  { to: "/transfers", label: "File Sharing", icon: Send },
  { to: "/friends", label: "Friends", icon: UserPlus },
  { to: "/incoming", label: "Incoming", icon: Inbox },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { counts } = useNotifications();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // On every app load: ensure this device is registered and has E2E keys uploaded.
  // This makes the device discoverable for cross-user file transfers immediately.
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const fp = await getDeviceFingerprint();
        // Register or re-register (idempotent via fingerprint check in backend)
        const res = await registerDevice({
          name: navigator.userAgent.includes("Mobile") ? "Mobile Browser" : "Desktop Browser",
          device_type: toProtoDeviceType(guessDeviceType()),
          fingerprint: fp,
        });
        // Upload X25519 public key for this device (idempotent)
        await ensureDeviceKeys(res.device.device_id);
      } catch {
        // Silent fail — non-critical background setup
      }
    })();
  }, [user?.user_id]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-52 border-r border-gray-800/40 bg-gray-950/90 backdrop-blur-sm flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="h-14 flex items-center justify-between px-5 border-b border-gray-800/40">
          <Link to="/" className="text-base font-medium tracking-tight text-gray-200 hover:text-gray-100 transition-colors">
            vinctum
          </Link>
          <div className="flex items-center gap-2">
            {counts.total > 0 && (
              <Link to="/incoming" className="relative text-gray-400 hover:text-emerald-400 transition-colors">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                  {counts.total > 9 ? "9+" : counts.total}
                </span>
              </Link>
            )}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-400 ml-0"
                    : "text-gray-500 hover:text-gray-300 border-l-2 border-transparent"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.to === "/friends" && counts.friend_requests > 0 && (
                <span className="ml-auto w-5 h-5 bg-emerald-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                  {counts.friend_requests}
                </span>
              )}
              {item.to === "/incoming" && counts.incoming_transfers > 0 && (
                <span className="ml-auto w-5 h-5 bg-emerald-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                  {counts.incoming_transfers}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800/40">
          <div className="px-3 mb-3">
            <p className="text-sm text-gray-300 truncate">{user?.username}</p>
            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 text-left"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-52 relative">
        {/* Background orbs */}
        <div className="fixed inset-0 md:left-52 pointer-events-none overflow-hidden">
          <div className="bg-orb bg-orb-emerald" style={{ top: "10%", right: "15%" }} />
          <div className="bg-orb bg-orb-cyan" style={{ bottom: "20%", left: "10%" }} />
          <div className="bg-orb bg-orb-violet" style={{ top: "60%", right: "40%" }} />
        </div>

        {/* Mobile header */}
        <div className="sticky top-0 z-30 md:hidden flex items-center h-14 px-4 border-b border-gray-800/40 bg-gray-950/90 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 text-sm font-medium text-gray-300">vinctum</span>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Monitor, Users, Send, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/devices", label: "Devices", icon: Monitor },
  { to: "/sessions", label: "Sessions", icon: Users },
  { to: "/transfers", label: "File Sharing", icon: Send },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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

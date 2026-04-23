import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Overview" },
  { to: "/devices", label: "Devices" },
  { to: "/sessions", label: "Sessions" },
  { to: "/transfers", label: "File Sharing" },
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
        className={`w-52 border-r border-gray-800/40 bg-gray-950 flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-200 ${
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
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
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
                `block px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-gray-800/60 text-gray-100"
                    : "text-gray-500 hover:text-gray-300"
                }`
              }
            >
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
            className="w-full px-3 py-2 rounded-md text-sm text-gray-500 hover:text-red-400 transition-colors text-left"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-52">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 md:hidden flex items-center h-14 px-4 border-b border-gray-800/40 bg-gray-950">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="ml-3 text-sm font-medium text-gray-300">vinctum</span>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

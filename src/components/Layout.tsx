import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/devices", label: "Devices" },
  { to: "/sessions", label: "Sessions" },
  { to: "/transfers", label: "File Sharing" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <aside className="w-52 border-r border-gray-800/40 bg-gray-950 flex flex-col fixed inset-y-0 left-0">
        <div className="h-14 flex items-center px-5 border-b border-gray-800/40">
          <span className="text-base font-medium tracking-tight text-gray-200">vinctum</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
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

      <main className="flex-1 ml-52">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

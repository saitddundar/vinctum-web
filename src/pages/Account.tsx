import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800/40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-base font-medium tracking-tight text-gray-200 hover:text-gray-100 transition-colors">
            vinctum
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-4 py-1.5 rounded-md text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Dashboard
            </Link>
            <span className="px-4 py-1.5 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-100">
              Account
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-xl font-medium text-gray-100">Account</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile and settings</p>

        {/* Profile */}
        <div className="mt-8 rounded-md border border-gray-800/40 bg-gray-900/50 p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700/50 flex items-center justify-center text-lg text-gray-400 uppercase">
              {user?.username?.charAt(0) || "?"}
            </div>
            <div>
              <p className="text-sm text-gray-100 font-medium">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="border-t border-gray-800/40 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">User ID</span>
              <span className="text-xs text-gray-600 font-mono">{user?.user_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Email</span>
              <span className="text-xs text-gray-500">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Member since</span>
              <span className="text-xs text-gray-500">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-md text-sm text-red-400 border border-gray-800/40 hover:border-red-400/30 hover:bg-red-400/5 transition-colors"
          >
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}

import { useAuth } from "../../context/AuthContext";

export default function AccountTab() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">Account settings</p>

      <div className="rounded-md border border-gray-800/40 bg-gray-900/50 p-6 space-y-4">
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
            <span className="text-sm text-gray-400">Member since</span>
            <span className="text-xs text-gray-600">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

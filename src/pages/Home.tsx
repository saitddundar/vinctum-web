import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const signedIn = !!user;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800/40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-base font-medium tracking-tight text-gray-200">
            vinctum
          </span>
          <div className="flex items-center gap-3">
            {signedIn ? (
              <Link
                to="/dashboard"
                className="px-4 py-1.5 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-medium text-gray-100 leading-tight">
            Secure peer-to-peer file sharing
          </h1>
          <p className="text-gray-500 mt-3 text-lg leading-relaxed">
            Vinctum connects your devices with end-to-end encrypted transfers.
            No cloud storage, no middleman — files move directly between your
            paired devices.
          </p>

          {signedIn ? (
            <div className="mt-10 space-y-4">
              <p className="text-sm text-gray-400">
                Signed in as <span className="text-gray-300">{user.username}</span>
              </p>
              <div className="flex gap-3">
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 rounded-md bg-gray-100 text-gray-950 text-sm font-medium hover:bg-white transition-colors"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/transfers"
                  className="px-5 py-2.5 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 transition-colors"
                >
                  Send a file
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-10 flex gap-3">
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-md bg-gray-100 text-gray-950 text-sm font-medium hover:bg-white transition-colors"
              >
                Get started
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 transition-colors"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20">
          <div className="rounded-md border border-gray-800/40 bg-gray-900/50 p-5">
            <p className="text-sm font-medium text-gray-300">End-to-end encrypted</p>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
              X25519 key exchange with AES-256-GCM encryption. Only your devices can decrypt the data.
            </p>
          </div>
          <div className="rounded-md border border-gray-800/40 bg-gray-900/50 p-5">
            <p className="text-sm font-medium text-gray-300">Multi-device</p>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
              Pair phones, tablets, and computers. Transfer files across all your devices seamlessly.
            </p>
          </div>
          <div className="rounded-md border border-gray-800/40 bg-gray-900/50 p-5">
            <p className="text-sm font-medium text-gray-300">No cloud storage</p>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
              Files are chunked and streamed directly between devices. Nothing is stored on our servers.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/40 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <p className="text-xs text-gray-600">Vinctum — secure device-to-device transfers</p>
        </div>
      </footer>
    </div>
  );
}

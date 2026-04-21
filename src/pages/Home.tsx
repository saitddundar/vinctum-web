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
          <span className="text-base font-medium tracking-tight text-gray-200">vinctum</span>
          <div className="flex items-center gap-3">
            {signedIn ? (
              <>
                <Link to="/dashboard" className="px-4 py-1.5 rounded-md text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  Dashboard
                </Link>
                <Link to="/account" className="px-4 py-1.5 rounded-md text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  Account
                </Link>
              </>
            ) : (
              <Link to="/login" className="px-4 py-1.5 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6">
        <div className="py-24 relative">
          {/* Glow effect */}
          <div className="absolute top-12 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-20 right-1/4 w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">End-to-end encrypted</p>
            <h1 className="text-4xl font-medium text-gray-100 leading-tight">
              Secure peer-to-peer<br />file sharing
            </h1>
            <p className="text-gray-500 mt-4 text-lg leading-relaxed max-w-xl">
              Vinctum connects your devices with end-to-end encrypted transfers.
              No cloud storage, no middleman — files move directly between your paired devices.
            </p>

            {signedIn ? (
              <div className="mt-10 space-y-4">
                <p className="text-sm text-gray-400">
                  Signed in as <span className="text-gray-300">{user.username}</span>
                </p>
                <div className="flex gap-3">
                  <Link to="/dashboard" className="px-5 py-2.5 rounded-md bg-gray-100 text-gray-950 text-sm font-medium hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    Go to Dashboard
                  </Link>
                  <Link to="/transfers" className="px-5 py-2.5 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    Send a file
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-10 flex gap-3">
                <Link to="/register" className="px-5 py-2.5 rounded-md bg-gray-100 text-gray-950 text-sm font-medium hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  Get started
                </Link>
                <Link to="/login" className="px-5 py-2.5 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Transfer visualization */}
        <div className="rounded-xl border border-gray-800/40 bg-gray-900/30 p-8 mb-16">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <DeviceBlock icon="💻" label="Your Computer" />
            <div className="flex-1 mx-6 relative">
              <div className="h-px bg-gray-800" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/40 animate-pulse [animation-delay:300ms]" />
                </div>
              </div>
              <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 whitespace-nowrap">AES-256-GCM encrypted</p>
            </div>
            <DeviceBlock icon="📱" label="Your Phone" />
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <FeatureCard
            title="End-to-end encrypted"
            desc="X25519 key exchange with AES-256-GCM encryption. Only your devices can decrypt the data."
            icon="🔒"
          />
          <FeatureCard
            title="Multi-device"
            desc="Pair phones, tablets, and computers. Transfer files across all your devices seamlessly."
            icon="🔗"
          />
          <FeatureCard
            title="No cloud storage"
            desc="Files are chunked and streamed directly between devices. Nothing is stored on our servers."
            icon="☁️"
          />
        </div>

        {/* How it works */}
        <div className="mb-20">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-6 text-center">How it works</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StepCard step="1" title="Register" desc="Create an account and register your first device" />
            <StepCard step="2" title="Pair" desc="Generate a pairing code and link your other devices" />
            <StepCard step="3" title="Send" desc="Pick a file and select a target device" />
            <StepCard step="4" title="Receive" desc="File arrives encrypted, decrypted only on your device" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/40">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="text-xs text-gray-600">Vinctum — secure device-to-device transfers</p>
          <div className="flex gap-4">
            <Link to="/register" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Get started</Link>
            <Link to="/login" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DeviceBlock({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-14 h-14 rounded-xl border border-gray-800/50 bg-gray-900/60 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div className="rounded-md border border-gray-800/40 bg-gray-900/50 p-5 hover:border-gray-700/70 hover:-translate-y-px transition-all duration-200">
      <span className="text-lg">{icon}</span>
      <p className="text-sm font-medium text-gray-300 mt-2">{title}</p>
      <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="rounded-md border border-gray-800/40 bg-gray-900/50 p-4 hover:border-gray-700/70 hover:-translate-y-px transition-all duration-200">
      <span className="text-xs text-gray-600 font-mono">{step}.</span>
      <p className="text-sm font-medium text-gray-300 mt-1">{title}</p>
      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{desc}</p>
    </div>
  );
}

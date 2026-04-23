import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const signedIn = !!user;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-800/40 relative z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
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

      <main className="max-w-6xl mx-auto px-6">
        {/* Hero */}
        <section className="relative pt-20 pb-28 md:pt-28 md:pb-36">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-emerald-500/[0.04] to-transparent rounded-full blur-3xl" />
            <div className="absolute top-32 left-[10%] w-80 h-80 bg-blue-500/[0.03] rounded-full blur-3xl" />
            <div className="absolute top-48 right-[15%] w-64 h-64 bg-violet-500/[0.02] rounded-full blur-3xl" />
          </div>

          <div className="relative text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-800/60 bg-gray-900/40 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
              <span className="text-xs text-gray-400 tracking-wide">Zero-knowledge architecture</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1]">
              Your files travel<br />
              <span className="bg-gradient-to-r from-gray-100 via-gray-300 to-gray-500 bg-clip-text text-transparent">
                between your devices.
              </span><br />
              <span className="text-gray-500">Nothing else.</span>
            </h1>

            <p className="text-gray-400 mt-6 text-lg leading-relaxed max-w-xl mx-auto">
              Direct device-to-device transfers with end-to-end encryption.
              No cloud. No intermediary. No trace.
            </p>

            {signedIn ? (
              <div className="mt-10 space-y-4">
                <p className="text-sm text-gray-500">
                  Signed in as <span className="text-gray-300">{user.username}</span>
                </p>
                <div className="flex gap-3 justify-center">
                  <Link to="/dashboard" className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-950 text-sm font-medium hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    Go to Dashboard
                  </Link>
                  <Link to="/transfers" className="px-6 py-2.5 rounded-lg bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    Send a file
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-10 flex gap-3 justify-center">
                <Link to="/register" className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-950 text-sm font-medium hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  Get started
                </Link>
                <Link to="/login" className="px-6 py-2.5 rounded-lg bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Transfer visualization */}
        <section className="mb-24">
          <div className="rounded-2xl border border-gray-800/40 bg-gradient-to-b from-gray-900/60 to-gray-900/20 p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.03),transparent_70%)]" />
            <div className="relative flex items-center justify-between max-w-md mx-auto">
              <DeviceNode type="monitor" label="Computer" />
              <div className="flex-1 mx-8 relative">
                <div className="h-px bg-gradient-to-r from-gray-800 via-emerald-800/30 to-gray-800" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="w-1 h-1 rounded-full bg-emerald-400/70 animate-pulse [animation-delay:150ms]" />
                    <span className="w-1 h-1 rounded-full bg-emerald-400/40 animate-pulse [animation-delay:300ms]" />
                  </div>
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-emerald-500/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <span className="text-[10px] text-gray-600 whitespace-nowrap">AES-256-GCM</span>
                </div>
              </div>
              <DeviceNode type="phone" label="Phone" />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-24">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest text-gray-500">Built for privacy</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FeatureCard
              title="End-to-end encrypted"
              desc="X25519 key exchange with AES-256-GCM. Only your devices hold the keys."
              icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
            />
            <FeatureCard
              title="Multi-device mesh"
              desc="Pair any combination of devices. Files route through the shortest encrypted path."
              icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /><line x1="12" y1="6" x2="12" y2="11" /><line x1="12" y1="13" x2="12" y2="18" /><line x1="6" y1="12" x2="11" y2="12" /><line x1="13" y1="12" x2="18" y2="12" /></svg>}
            />
            <FeatureCard
              title="Zero storage"
              desc="Files are chunked and streamed peer-to-peer. We never see or store your data."
              icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
            />
          </div>
        </section>

        {/* Protocol */}
        <section className="mb-24">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest text-gray-500">Protocol</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-gray-800/30 rounded-xl overflow-hidden border border-gray-800/40">
            <StepCard step="01" title="Authenticate" desc="Register and verify your identity with the network" />
            <StepCard step="02" title="Pair" desc="Exchange cryptographic keys between your devices" />
            <StepCard step="03" title="Transfer" desc="Select a file and initiate a direct encrypted stream" />
            <StepCard step="04" title="Verify" desc="Integrity check on arrival, decrypted only on-device" />
          </div>
        </section>

        {/* Trust indicators */}
        <section className="mb-20">
          <div className="rounded-xl border border-gray-800/40 bg-gray-900/30 p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <TrustItem value="E2EE" label="Encryption standard" />
              <TrustItem value="P2P" label="Transfer protocol" />
              <TrustItem value="0 B" label="Stored on servers" />
              <TrustItem value="X25519" label="Key exchange" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/40">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="text-xs text-gray-600">vinctum</p>
          <div className="flex gap-4">
            <Link to="/register" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Get started</Link>
            <Link to="/login" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DeviceNode({ type, label }: { type: "monitor" | "phone"; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="w-14 h-14 rounded-xl border border-gray-800/50 bg-gray-900/80 flex items-center justify-center text-gray-400">
        {type === "monitor" ? (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18.01" /></svg>
        )}
      </div>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-800/40 bg-gray-900/40 p-6 hover:border-gray-700/60 hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="w-9 h-9 rounded-lg border border-gray-800/50 bg-gray-800/30 flex items-center justify-center text-gray-400 group-hover:text-gray-300 group-hover:border-gray-700/60 transition-colors">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-200 mt-4">{title}</p>
      <p className="text-sm text-gray-500 mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="bg-gray-900/60 p-5 hover:bg-gray-900/80 transition-colors">
      <span className="text-[10px] text-gray-600 font-mono tracking-wider">{step}</span>
      <p className="text-sm font-medium text-gray-200 mt-2">{title}</p>
      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{desc}</p>
    </div>
  );
}

function TrustItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-lg font-mono font-medium text-gray-200">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

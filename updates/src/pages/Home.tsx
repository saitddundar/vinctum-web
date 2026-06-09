import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, Network, BarChart3, Lock, Monitor, Smartphone } from "lucide-react";

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
              <Link to="/login" className="px-4 py-1.5 rounded-md border border-gray-700/50 bg-transparent text-sm text-gray-300 hover:text-gray-100 hover:border-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
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
            <div className="bg-orb bg-orb-emerald" style={{ top: "-10%", left: "40%" }} />
            <div className="bg-orb bg-orb-cyan" style={{ top: "30%", left: "5%" }} />
            <div className="bg-orb bg-orb-violet" style={{ top: "40%", right: "10%" }} />
          </div>

          <div className="relative text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-emerald-400/80 tracking-wide">Zero-knowledge architecture</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1]">
              Your files travel<br />
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
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
                  <Link to="/transfers" className="px-6 py-2.5 rounded-lg bg-emerald-500 text-gray-950 text-sm font-medium hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    Send a file
                  </Link>
                  <Link to="/dashboard" className="px-6 py-2.5 rounded-lg border border-gray-700/50 bg-transparent text-sm text-gray-300 hover:text-gray-100 hover:border-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-10 flex gap-3 justify-center">
                <Link to="/register" className="px-6 py-2.5 rounded-lg bg-emerald-500 text-gray-950 text-sm font-medium hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  Get started
                </Link>
                <Link to="/login" className="px-6 py-2.5 rounded-lg border border-gray-700/50 bg-transparent text-sm text-gray-300 hover:text-gray-100 hover:border-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Transfer visualization */}
        <section className="mb-24">
          <div className="glass-card-static p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.05),transparent_70%)]" />
            <div className="relative flex items-center justify-between max-w-md mx-auto">
              <DeviceNode type="monitor" label="Computer" />
              <div className="flex-1 mx-8 relative">
                <div className="h-px bg-gradient-to-r from-gray-800 via-emerald-500/30 to-gray-800" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="w-1 h-1 rounded-full bg-emerald-400/70 animate-pulse [animation-delay:150ms]" />
                    <span className="w-1 h-1 rounded-full bg-emerald-400/40 animate-pulse [animation-delay:300ms]" />
                  </div>
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-500/50" />
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
              icon={<Shield className="w-5 h-5" />}
            />
            <FeatureCard
              title="Multi-device mesh"
              desc="Pair any combination of devices. Files route through the shortest encrypted path."
              icon={<Network className="w-5 h-5" />}
            />
            <FeatureCard
              title="Zero storage"
              desc="Files are chunked and streamed peer-to-peer. We never see or store your data."
              icon={<BarChart3 className="w-5 h-5" />}
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
          <div className="glass-card-static p-8">
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
            <Link to="/register" className="text-xs text-gray-600 hover:text-emerald-400 transition-colors">Get started</Link>
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
      <div className="w-14 h-14 rounded-xl glass-card-static flex items-center justify-center text-gray-400">
        {type === "monitor" ? (
          <Monitor className="w-6 h-6" />
        ) : (
          <Smartphone className="w-5 h-5" />
        )}
      </div>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="glass-card p-6 group">
      <div className="w-9 h-9 rounded-lg border border-emerald-500/10 bg-emerald-500/5 flex items-center justify-center text-emerald-400/70 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-colors">
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
      <span className="text-[10px] text-emerald-500/50 font-mono tracking-wider">{step}</span>
      <p className="text-sm font-medium text-gray-200 mt-2">{title}</p>
      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{desc}</p>
    </div>
  );
}

function TrustItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-gray-100">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

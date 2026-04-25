import { Link } from "react-router-dom";
import { ArrowRight, Terminal } from "lucide-react";
import HeroMesh from "../components/HeroMesh";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const signedIn = !!user;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-800/40 relative z-10 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-lg font-medium tracking-tight text-gray-100">vinctum</span>
            <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
              <span className="hover:text-gray-200 cursor-pointer transition-colors">Product</span>
              <span className="hover:text-gray-200 cursor-pointer transition-colors">Protocol</span>
              <span className="hover:text-gray-200 cursor-pointer transition-colors">Security</span>
              <span className="hover:text-gray-200 cursor-pointer transition-colors">Pricing</span>
              <span className="hover:text-gray-200 cursor-pointer transition-colors">Docs</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {signedIn ? (
              <>
                <Link to="/dashboard" className="px-4 py-2 rounded-md border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 transition-colors">
                  Dashboard
                </Link>
                <Link to="/account" className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-gray-950 font-medium text-sm hover:scale-105 transition-transform">
                  {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                </Link>
              </>
            ) : (
              <Link to="/login" className="px-4 py-2 rounded-md border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 transition-colors">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-32">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 w-full h-[500px] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(52,211,153,0.05),transparent)]" />
            <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-500/10 blur-[120px] rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-gray-900/50 border border-gray-800 text-xs text-gray-400 mb-8">
                  <span className="px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">NEW</span>
                  <span>v2.1 · Post-quantum key exchange (Kyber-768) in beta</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                </div>
                
                <h1 className="text-[72px] font-semibold leading-[0.95] tracking-[-0.04em] text-gray-50 m-0">
                  Your files<br />
                  move <span className="text-emerald-400 font-normal italic text-[76px] font-serif">between you</span>.<br />
                  <span className="text-gray-500">Nothing else.</span>
                </h1>
                
                <p className="text-lg text-gray-400 leading-relaxed max-w-[500px] mt-8 mb-10 font-normal">
                  Vinctum is a zero-knowledge mesh for your devices. Files travel directly, end-to-end encrypted, with no cloud intermediary ever touching plaintext. Built on WireGuard, libp2p, and X25519.
                </p>
                
                <div className="flex gap-3">
                  <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 text-gray-950 font-medium hover:bg-emerald-400 transition-colors">
                    Start free — no card
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-700/50 bg-gray-900/50 text-gray-300 hover:text-white hover:bg-gray-800/80 transition-colors">
                    <Terminal className="w-4 h-4" />
                    Self-host
                  </button>
                </div>

                <div className="flex gap-8 mt-12 pt-8 border-t border-gray-800/60">
                  <TrustMini label="Source auditable" value="MIT" />
                  <TrustMini label="Stored on servers" value="0 B" />
                  <TrustMini label="Key exchange" value="X25519" />
                  <TrustMini label="Cipher" value="AES-GCM" />
                </div>
              </div>
              
              <HeroMesh />
            </div>
          </div>
        </section>

        {/* Narrative Section */}
        <section className="py-32 border-t border-gray-800/40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-16">
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-emerald-400 mb-4">The problem</div>
                <h2 className="text-4xl font-medium tracking-tight leading-[1.1] m-0">
                  Every file<br />you sent today<br />
                  <span className="text-gray-400 font-serif italic">left a copy</span><br />
                  somewhere else.
                </h2>
              </div>
              <div className="pt-2">
                <p className="text-lg text-gray-400 leading-relaxed max-w-3xl m-0">
                  Dropbox, iCloud, WeTransfer — they all work the same way. Your file gets uploaded to a machine you don't own, sits there in plaintext or with a key the provider holds, then gets downloaded again on the other side. Your devices are <em className="not-italic text-gray-200 border-b border-dashed border-emerald-500/50">one meter apart</em>, and the bytes still travel thousands of kilometers.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
                  <StatTile n="4.2B" label="files uploaded daily to consumer cloud" tone="amber" />
                  <StatTile n="82%" label="of those could be direct transfers" tone="cyan" />
                  <StatTile n="$0.023" label="average cost per GB, to you" tone="violet" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Protocol Deep Dive Section */}
        <section className="py-32 border-t border-gray-800/40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-cyan-400 mb-4">Protocol</div>
                <h2 className="text-4xl font-medium tracking-tight leading-[1.08] m-0">
                  The cryptography<br />
                  is boring. <span className="text-gray-400 font-serif italic">That's the point.</span>
                </h2>
                <p className="text-[15px] text-gray-400 mt-6 leading-relaxed max-w-[460px]">
                  We don't roll our own crypto. The Vinctum protocol is a thin integration of battle-tested primitives — the same ones your bank, your messenger, and WireGuard use every day.
                </p>
                <div className="mt-8 flex flex-col gap-3.5">
                  {[
                    ['Identity', 'Ed25519 keypair per device, bound to a user Ed25519 root'],
                    ['Session', 'X25519 ECDH with ephemeral sender keys (forward secrecy)'],
                    ['Cipher', 'AES-256-GCM with per-chunk nonces, 256 KB chunk size'],
                    ['Integrity', 'Merkle tree over ciphertext chunks, signed root'],
                    ['Transport', 'QUIC over UDP, libp2p hole-punch, fallback via your own relay'],
                  ].map(([k, v], i) => (
                    <div key={i} className={`grid grid-cols-[100px_1fr] gap-4 pb-3 ${i < 4 ? 'border-b border-gray-800/40' : ''}`}>
                      <div className="font-mono text-[11px] text-gray-500 uppercase tracking-widest pt-1">{k}</div>
                      <div className="text-[13.5px] text-gray-400 leading-relaxed">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <ProtocolDiagram />
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-32 border-t border-gray-800/40 text-center relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_40%,rgba(52,211,153,0.05),transparent_70%)] pointer-events-none" />
          <div className="max-w-2xl mx-auto relative px-6">
            <h2 className="text-6xl font-medium tracking-tight leading-[0.98] m-0">
              Your devices<br />
              <span className="text-emerald-400 font-serif italic text-[64px]">deserve</span> to talk<br />
              to each other.
            </h2>
            <p className="text-lg text-gray-400 mt-8 mb-10 leading-relaxed">
              No cloud. No middleman. No subscription for the bytes you already own.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-emerald-500 text-gray-950 font-medium hover:bg-emerald-400 transition-colors">
                Create free account <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="px-6 py-3.5 rounded-lg border border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors">
                Read the whitepaper
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/40 py-16 bg-gray-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>© 2026 Vinctum Labs · <span className="text-emerald-400">●</span> All systems operational</span>
            <span className="font-mono">build 2.1.3 · f4a1c27</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TrustMini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-lg font-medium tracking-tight text-gray-100">{value}</div>
      <div className="text-[11px] text-gray-500 mt-1 tracking-wide">{label}</div>
    </div>
  );
}

function StatTile({ n, label, tone }: { n: string; label: string; tone: "amber" | "cyan" | "violet" }) {
  const c = tone === "amber" ? "text-amber-400" : tone === "cyan" ? "text-cyan-400" : "text-violet-400";
  return (
    <div className="rounded-xl border border-gray-800/40 bg-gray-900/40 p-6">
      <div className={`font-mono text-3xl font-medium tracking-tight ${c}`}>{n}</div>
      <div className="text-sm text-gray-400 mt-3 leading-relaxed">{label}</div>
    </div>
  );
}

function ProtocolDiagram() {
  return (
    <div className="rounded-xl border border-gray-800/40 bg-gray-900/40 p-1 overflow-hidden shadow-2xl">
      <div className="bg-gray-950/50 rounded-lg px-4 py-3 border-b border-gray-800/40 flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
        </div>
        <span className="font-mono text-[11px] text-gray-500">vinctum.protocol.handshake.log</span>
        <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">verified</span>
      </div>
      <pre className="m-0 px-5 py-5 text-xs leading-[1.65] text-gray-400 bg-gray-950 overflow-x-auto font-mono">
        <span className="text-gray-500">{"// device A → device B"}</span>{'\n'}
        <span className="text-cyan-400">→ HELLO</span>  {"{"} node_id: <span className="text-emerald-400">"8f3a…c4b1"</span>, vsn: <span className="text-amber-400">2.1</span> {"}"}{'\n'}
        <span className="text-cyan-400">← HELLO</span>  {"{"} node_id: <span className="text-emerald-400">"a12e…9f34"</span>, vsn: <span className="text-amber-400">2.1</span> {"}"}{'\n\n'}
        <span className="text-gray-500">{"// ephemeral X25519"}</span>{'\n'}
        <span className="text-cyan-400">→ EPUB</span>   <span className="text-gray-200">0x{'a7f2e1b9c4d8…0f3e'}</span>{'\n'}
        <span className="text-cyan-400">← EPUB</span>   <span className="text-gray-200">0x{'3c4b8f91a2d5…7e1c'}</span>{'\n\n'}
        <span className="text-gray-500">{"// HKDF(SHA-256, shared, \"vt:xfer:<tid>\")"}</span>{'\n'}
        <span className="text-emerald-400">SESSION</span> key derived · <span className="text-gray-500">forward-secret</span>{'\n\n'}
        <span className="text-gray-500">{"// chunk transfer"}</span>{'\n'}
        <span className="text-cyan-400">→ CHUNK</span>  <span className="text-gray-200">#0001</span>/<span className="text-gray-200">0384</span>  <span className="text-gray-500">256 KB</span>  <span className="text-emerald-400">AES-GCM</span>{'\n'}
        <span className="text-cyan-400">→ CHUNK</span>  <span className="text-gray-200">#0002</span>/<span className="text-gray-200">0384</span>  <span className="text-gray-500">256 KB</span>  <span className="text-emerald-400">AES-GCM</span>{'\n'}
        {'  '}<span className="text-gray-500">…</span>{'\n'}
        <span className="text-cyan-400">← MROOT</span>  <span className="text-gray-200">0xf4a1…9c27</span> <span className="text-emerald-400">✓ Ed25519</span>{'\n'}
        <span className="text-emerald-400">COMPLETE</span> · 98.0 MB in 2.1s · <span className="text-gray-500">direct path</span>
      </pre>
    </div>
  );
}

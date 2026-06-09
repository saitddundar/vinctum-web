import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, Network, Lock, Monitor, ArrowRight, Check } from "lucide-react";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";
import { getPlatformStats, type PlatformStats } from "../lib/api";

import ScrollSpy from "../components/ScrollSpy";

const SPY_SECTIONS = [
  { id: "hero", label: "Intro" },
  { id: "narrative", label: "The Problem" },
  { id: "how", label: "How it works" },
  { id: "protocol", label: "Protocol" },
  { id: "features", label: "Features" },
  { id: "stats", label: "By the numbers" },
  { id: "pricing", label: "Pricing" },
  { id: "cta", label: "Get started" }
];

export default function Home() {
  const { user } = useAuth();
  const signedIn = !!user;
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    getPlatformStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <PublicHeader />
      <ScrollSpy sections={SPY_SECTIONS} />
      <div id="section-hero"><Hero signedIn={signedIn} /></div>
      <div id="section-narrative"><Narrative /></div>
      <div id="section-how"><HowItWorks /></div>
      <div id="section-protocol"><ProtocolSection /></div>
      <div id="section-features"><Features /></div>
      <div id="section-stats"><ByTheNumbers stats={stats} /></div>
      <div id="section-pricing"><PricingSection /></div>
      <div id="section-cta"><ClosingCTA /></div>
      <Footer />
    </div>
  );
}


function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="mesh-bg grid-bg" style={{ padding: "60px 40px 100px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px 4px 6px", borderRadius: 99, background: "oklch(1 0 0 / .03)", border: "1px solid var(--line-2)", fontSize: 11, color: "var(--fg-2)", marginBottom: 32 }}>
              <span className="pill pill-ok" style={{ fontSize: 9, padding: "1px 7px" }}>NEW</span>
              Post-quantum key exchange (Kyber-768) in beta
              <ArrowRight size={11} style={{ color: "var(--muted)" }} />
            </div>
            <h1 style={{ fontSize: 68, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 0.98, margin: 0 }}>
              Your files move<br />
              <span className="font-serif" style={{ color: "var(--accent)", fontSize: 72 }}>between you</span>.<br />
              <span style={{ color: "var(--muted-2)" }}>Nothing else.</span>
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--fg-2)", maxWidth: 500, marginTop: 28, fontWeight: 400 }}>
              Direct device-to-device transfers with end-to-end encryption. No cloud. No intermediary. No trace. Built on WireGuard, libp2p, and X25519.
            </p>
            <div className="flex gap-3 mt-9">
              {signedIn ? (
                <>
                  <Link to="/transfers" className="btn btn-primary" style={{ padding: "12px 20px", fontSize: 14 }}>
                    Send a file <ArrowRight size={14} />
                  </Link>
                  <Link to="/dashboard" className="btn btn-ghost" style={{ padding: "12px 20px", fontSize: 14 }}>Dashboard</Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary" style={{ padding: "12px 20px", fontSize: 14 }}>
                    Start free <ArrowRight size={14} />
                  </Link>
                  <Link to="/login" className="btn btn-ghost" style={{ padding: "12px 20px", fontSize: 14 }}>Sign in</Link>
                </>
              )}
            </div>
            <div className="flex gap-8 mt-10 pt-7" style={{ borderTop: "1px solid var(--line)" }}>
              {[["E2EE", "Encryption"], ["P2P", "Transport"], ["0 B", "Stored on servers"], ["X25519", "Key exchange"]].map(([v, l]) => (
                <div key={l}>
                  <div className="font-mono" style={{ fontSize: 17, fontWeight: 500, color: "var(--fg)", letterSpacing: "-0.02em" }}>{v}</div>
                  <div style={{ fontSize: 10.5, color: "var(--muted-2)", marginTop: 3 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <HeroCard />
        </div>
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div className="glass-card-static" style={{ padding: 20, boxShadow: "0 40px 80px rgba(0,0,0,.4)" }}>
      <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span style={{ fontSize: 11, color: "var(--fg-2)" }}>Live network</span>
        </div>
        <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>18ms avg</span>
      </div>
      <div style={{ position: "relative", height: 240, background: "oklch(0.18 0.014 235 / .5)", borderRadius: 10, border: "1px solid var(--line)", overflow: "hidden" }}>
        <svg width="100%" height="100%" viewBox="0 0 400 240" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="hg" cx="50%" cy="50%">
              <stop offset="0%" stopColor="oklch(0.78 0.15 160)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="oklch(0.78 0.15 160)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[["M200,120 L90,60","a"],["M200,120 L320,70","b"],["M200,120 L80,185","c"],["M200,120 L310,190","d"],["M90,60 L320,70","e"]].map(([d,id]) => (
            <g key={id}>
              <path id={`hp-${id}`} d={d as string} stroke="oklch(0.78 0.15 160 / .2)" strokeDasharray="4 3" fill="none" />
              <circle r="2" fill="var(--accent)" opacity="0.9">
                <animateMotion dur={`${2.5}s`} repeatCount="indefinite"><mpath href={`#hp-${id}`} /></animateMotion>
              </circle>
            </g>
          ))}
          {[{x:200,y:120,me:true,label:"MacBook Pro"},{x:90,y:60,label:"iPhone 15"},{x:320,y:70,label:"Linux WS"},{x:80,y:185,label:"iPad Air"},{x:310,y:190,label:"NAS"}].map((n,i) => (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={n.me?32:24} fill="url(#hg)" />
              <circle cx={n.x} cy={n.y} r={n.me?26:20} fill="oklch(0.22 0.014 235)" stroke={n.me?"var(--accent)":"oklch(1 0 0 / .1)"} strokeWidth={n.me?1.5:1} />
              <text x={n.x} y={n.y+4} textAnchor="middle" fill="var(--fg-2)" fontSize="9" fontFamily="Inter">{n.label.split(" ")[0].slice(0,3)}</text>
              <text x={n.x} y={n.y+(n.me?32:24)+14} textAnchor="middle" fill="var(--muted)" fontSize="9" fontFamily="Inter">{n.label}</text>
            </g>
          ))}
        </svg>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, marginTop: 12, background: "var(--line)", borderRadius: 8, overflow: "hidden" }}>
        {[["UP","48.2 MB/s","var(--accent)"],["DOWN","12.8 MB/s","var(--cyan)"],["CIPHER","AES-GCM","var(--violet)"]].map(([k,v,c]) => (
          <div key={k} style={{ padding: "9px 11px", background: "var(--panel)" }}>
            <div style={{ fontSize: 8, color: "var(--muted-2)", letterSpacing: ".09em", textTransform: "uppercase" }}>{k}</div>
            <div className="font-mono" style={{ fontSize: 12, color: c as string, marginTop: 2, fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Narrative() {
  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "300px 1fr", gap: 80 }}>
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--accent)", marginBottom: 14 }}>The problem</div>
          <h2 style={{ fontSize: 34, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0 }}>
            Every file you sent today<br /><span className="font-serif" style={{ color: "var(--fg-2)" }}>left a copy somewhere else.</span>
          </h2>
        </div>
        <div style={{ paddingTop: 8 }}>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--fg-2)", margin: 0, maxWidth: 640 }}>
            Cloud services upload your file to a machine you don't own, where it sits in plaintext or under a key the provider holds — then gets downloaded on the other side. Your devices are one meter apart and the bytes still travel thousands of kilometers.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 40 }}>
            {[["4.2B","files uploaded to cloud daily","var(--amber)"],["82%","could be direct transfers","var(--cyan)"],["0 B","we ever store","var(--accent)"]].map(([n,l,c]) => (
              <div key={l} className="flat-card" style={{ padding: "20px 18px" }}>
                <div className="font-mono" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em", color: c as string }}>{n}</div>
                <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 8, lineHeight: 1.45 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const ISO_LAYERS = [
  {
    n: "01", t: "Authenticate",
    d: "Ed25519 keypair generated on-device. Private key never leaves. Your identity is cryptographically bound to hardware.",
    bg: "#064e3b", ext: "#022c22", color: "#34d399", icon: Shield // Emerald
  },
  {
    n: "02", t: "Pair",
    d: "A 6-digit ephemeral code exchanges public keys between devices. Valid for 60 seconds. No server involved.",
    bg: "#082f49", ext: "#041f33", color: "#38bdf8", icon: Network // Sky
  },
  {
    n: "03", t: "Transfer",
    d: "X25519 ECDH derives a per-file session key. The file is split into 256 KB chunks, each encrypted with AES-256-GCM.",
    bg: "#78350f", ext: "#451a03", color: "#fbbf24", icon: Lock // Amber
  },
  {
    n: "04", t: "Verify",
    d: "A Merkle tree is computed over the ciphertext. The root is signed by the sender's key. Receiver validates before decrypting.",
    bg: "#4c1d95", ext: "#2e1065", color: "#c084fc", icon: Check // Purple
  }
];

function getExtrusion(color: string) {
  let shadow = "";
  // Greatly reduced step count for 60fps performance
  for(let i=1; i<=10; i++) {
    shadow += `-${i}px ${i}px 0 ${color}${i === 10 ? "" : ", "}`;
  }
  // Hard shadow on the floor instead of a massive 50px blur, which was killing rendering speed
  shadow += `, -20px 20px 0 rgba(0,0,0,0.4)`;
  return shadow;
}

function HowItWorks() {
  const [hovered, setHovered] = useState<number | null>(null);

  const activeLayer = hovered !== null ? ISO_LAYERS[hovered] : ISO_LAYERS[3];

  return (
    <section style={{ padding: "110px 40px", borderTop: "1px solid var(--line)", background: "oklch(0.14 0.012 235)", overflow: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 500px", gap: 80, alignItems: "center" }}>
        
        {/* Left Text */}
        <div style={{ paddingRight: 40 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--accent)", marginBottom: 20 }}>How it works</div>
          <h2 style={{ fontSize: 44, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.05, margin: 0, marginBottom: 40 }}>
            Four layers. <br/><span className="font-serif" style={{ color: "var(--fg-2)" }}>One mesh.</span>
          </h2>
          
          <div style={{ 
            padding: "32px", borderRadius: 16, 
            background: "oklch(1 0 0 / .02)", border: "1px solid var(--line)",
            minHeight: 180, transition: "border-color 0.4s"
          }}>
             <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
               <div style={{ 
                 fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700,
                 color: activeLayer.color, background: "oklch(1 0 0 / .08)",
                 padding: "4px 10px", borderRadius: 6, transition: "color 0.3s"
               }}>
                 {activeLayer.n}
               </div>
               <div style={{ fontSize: 20, fontWeight: 500, color: "var(--fg)" }}>
                 {activeLayer.t}
               </div>
             </div>
             <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--fg-2)", margin: 0 }}>
               {activeLayer.d}
             </p>
          </div>
        </div>

        {/* Right Isometric Stack */}
        <div style={{ height: 480, display: "flex", alignItems: "center", justifyContent: "center", perspective: 1400 }}>
          {/* marginTop 120px perfectly counters the local translateZ upward visual shift (Z*sin(60)) */}
          <div style={{ position: "relative", width: 280, height: 280, marginTop: 120, transformStyle: "preserve-3d", transform: "rotateX(60deg) rotateZ(-45deg)" }}>
            {ISO_LAYERS.map((layer, i) => {
              const isHovered = hovered === i;
              const isAboveHovered = hovered !== null && i > hovered;
              
              // Base spacing 90px
              const baseZ = i * 90;
              // Expand when hovered
              const pushUp = isHovered ? 30 : (isAboveHovered ? 45 : 0);
              const z = baseZ + pushUp;

              return (
                <div
                  key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 44,
                    background: layer.bg,
                    boxShadow: getExtrusion(layer.ext),
                    transform: `translateZ(${z}px)`,
                    // Use a slightly faster transition for snappier feel
                    transition: "all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.35s",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${layer.color}30`,
                    zIndex: i,
                    willChange: "transform", // Hardware acceleration hint
                    filter: isHovered ? "brightness(1.15) saturate(1.15)" : "brightness(1) saturate(1)",
                  }}
                >
                  <layer.icon size={96} color={layer.color} strokeWidth={1.5} style={{ 
                    opacity: isHovered ? 1 : 0.6, 
                    transition: "opacity 0.3s",
                    transform: "translateZ(1px)"
                  }} />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

function ProtocolSection() {
  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 80, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--cyan)", marginBottom: 14 }}>Protocol</div>
          <h2 style={{ fontSize: 38, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0 }}>
            The cryptography is boring.<br /><span className="font-serif" style={{ color: "var(--fg-2)" }}>That's the point.</span>
          </h2>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              ["Identity","Ed25519 keypair per device, bound to user root key"],
              ["Session", "X25519 ECDH with ephemeral sender keys — forward secret"],
              ["Cipher",  "AES-256-GCM with per-chunk nonces, 256 KB chunks"],
              ["Integrity","Merkle tree over ciphertext, signed root"],
              ["Transport","QUIC over UDP, libp2p NAT hole-punch, self-relay fallback"],
            ].map(([k,v],i) => (
              <div key={k} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 14, paddingBottom: 12, borderBottom: i < 4 ? "1px solid var(--line)" : "none" }}>
                <div className="font-mono" style={{ fontSize: 10.5, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".05em" }}>{k}</div>
                <div style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.5 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Code block */}
        <div className="flat-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--line)", background: "oklch(0.12 0.012 235)", display: "flex", alignItems: "center", gap: 8 }}>
            <div className="flex gap-1.5">{["oklch(0.72 0.17 25 / .4)","oklch(0.84 0.13 85 / .4)","oklch(0.78 0.15 160 / .5)"].map(c=><span key={c} style={{width:10,height:10,borderRadius:99,background:c}}/>)}</div>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)" }}>handshake.log</span>
          </div>
          <pre className="font-mono" style={{ margin: 0, padding: "20px 22px", fontSize: 11.5, lineHeight: 1.7, color: "var(--fg-2)", background: "oklch(0.13 0.012 235)", overflow: "auto" }}>
{`// device A → device B
→ HELLO  { node: "8f3a…c4b1", vsn: 2.1 }
← HELLO  { node: "a12e…9f34", vsn: 2.1 }

// ephemeral X25519
→ EPUB   0xa7f2e1b9c4d8…0f3e
← EPUB   0x3c4b8f91a2d5…7e1c

// HKDF(SHA-256, shared, "vt:xfer:<tid>")
SESSION key derived · forward-secret

// chunk transfer
→ CHUNK  #0001/0384  256 KB  AES-GCM
→ CHUNK  #0002/0384  256 KB  AES-GCM
  …
← MROOT  0xf4a1…9c27 ✓ Ed25519
COMPLETE · 98 MB in 2.1s · direct`}
          </pre>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--accent)", marginBottom: 14 }}>Capabilities</div>
            <h2 style={{ fontSize: 38, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.08, margin: 0 }}>
              Built like infrastructure.<br /><span className="font-serif" style={{ color: "var(--fg-2)" }}>Used like a drop-box.</span>
            </h2>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--line)", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
          {[
            {Icon:Shield, t:"End-to-end encrypted",d:"Keys never leave your devices. Not even temporarily. We built the backend to reject plaintext."},
            {Icon:Network,t:"Multi-device mesh",   d:"Pair any combination of devices. Files route through the shortest encrypted path."},
            {Icon:Monitor,t:"Self-host ready",      d:"Run vinctum-core on your own box. Same binary, same protocol, full control."},
            {Icon:Lock,   t:"Direct paths",         d:"libp2p NAT hole-punch succeeds in 87% of home networks. When it fails, your own device relays."},
            {Icon:Shield, t:"Hardware keys",        d:"Ed25519 in Secure Enclave (Apple), StrongBox (Android), TPM (Windows/Linux)."},
            {Icon:Network,t:"ML-tuned routing",     d:"Nodes score each other on latency and reliability. Bad routes are pruned automatically."},
          ].map((f,i) => (
            <div key={i} style={{ background: "var(--bg)", padding: "28px 26px" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "oklch(0.78 0.15 160 / .08)", border: "1px solid oklch(0.78 0.15 160 / .2)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <f.Icon size={16} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>{f.t}</div>
              <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 9, lineHeight: 1.6 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val < 10 ? val.toFixed(1) : Math.round(val)} ${units[i]}`;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function ByTheNumbers({ stats }: { stats: PlatformStats | null }) {
  const items = [
    [stats ? formatBytes(stats.total_bytes) : "---", "transferred through the mesh"],
    [stats ? formatCount(stats.total_devices) : "---", "active devices paired"],
    [stats ? formatCount(stats.total_transfers) : "---", "encrypted transfers completed"],
    ["0", "bytes of user data on our servers"],
  ];

  return (
    <section style={{ padding: "80px 40px", borderTop: "1px solid var(--line)", background: "oklch(0.14 0.012 235)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          {items.map(([n, l], i) => (
            <div key={i} style={{ padding: "36px 24px", borderRight: i < 3 ? "1px solid var(--line)" : "none" }}>
              <div className="font-mono" style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.03em" }}>{n}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, lineHeight: 1.45 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const tiers = [
    { name:"Personal", price:"Free",  sub:"forever",        features:["Up to 5 devices","Unlimited transfer size","Community support","Self-host optional"],  cta:"Start free" },
    { name:"Pro",      price:"$6",    sub:"per month",      features:["Unlimited devices","Priority relay pool","Family sharing","Mobile backup","Email support"], cta:"Try Pro", highlight:true },
    { name:"Team",     price:"$12",   sub:"per user / mo",  features:["SSO / SCIM","Audit logs","Policy controls","SLA","Dedicated relay region"],              cta:"Contact sales" },
  ];
  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--accent)", marginBottom: 14 }}>Pricing</div>
          <h2 style={{ fontSize: 38, fontWeight: 500, letterSpacing: "-0.025em", margin: 0 }}>Simple. <span className="font-serif" style={{ color: "var(--fg-2)" }}>Honest.</span></h2>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 12 }}>We don't meter bandwidth — you're not using ours.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {tiers.map(t => (
            <div key={t.name} className={t.highlight ? "glass-card-static" : "flat-card"} style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16, ...(t.highlight ? { border: "1px solid oklch(0.78 0.15 160 / .3)", boxShadow: "0 0 0 1px oklch(0.78 0.15 160 / .15), 0 20px 60px rgba(0,0,0,.3)" } : {}) }}>
              <div>
                <div style={{ fontSize: 13, color: "var(--fg-2)", fontWeight: 500 }}>{t.name}</div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span style={{ fontSize: 32, fontWeight: 500, letterSpacing: "-0.02em" }}>{t.price}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{t.sub}</span>
                </div>
              </div>
              <div style={{ height: 1, background: "var(--line)" }} />
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9 }}>
                {t.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5" style={{ fontSize: 13, color: "var(--fg-2)" }}>
                    <Check size={12} style={{ color: "var(--accent)", flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <Link to={t.name === "Team" ? "#" : "/register"} className={`btn ${t.highlight ? "btn-primary" : "btn-ghost"}`} style={{ justifyContent: "center", marginTop: "auto" }}>{t.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="grid-bg" style={{ padding: "120px 40px", borderTop: "1px solid var(--line)", textAlign: "center", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 60% at 50% 40%, oklch(0.78 0.15 160 / .07), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
        <h2 style={{ fontSize: 56, fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 0.98, margin: 0 }}>
          Your devices<br /><span className="font-serif" style={{ color: "var(--accent)", fontSize: 60 }}>deserve</span> to talk<br />to each other.
        </h2>
        <p style={{ fontSize: 16, color: "var(--fg-2)", marginTop: 28, lineHeight: 1.55 }}>No cloud. No middleman. No subscription for bytes you already own.</p>
        <div className="flex gap-3 justify-center mt-9">
          <Link to="/register" className="btn btn-primary" style={{ padding: "13px 22px", fontSize: 14 }}>Create free account <ArrowRight size={14} /></Link>
          <a href="#" className="btn btn-ghost" style={{ padding: "13px 22px", fontSize: 14 }}>Read the whitepaper</a>
        </div>
      </div>
    </section>
  );
}


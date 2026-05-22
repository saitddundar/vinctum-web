import { Link } from "react-router-dom";
import { ArrowRight, Monitor, Smartphone, Laptop, Server, Zap, Globe, Shield, Network, Cpu, RefreshCw } from "lucide-react";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export default function Product() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <PublicHeader />
      <Hero />
      <Architecture />
      <UseCases />
      <DeviceSupport />
      <OpenSource />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="mesh-bg grid-bg" style={{ padding: "120px 40px 100px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", zIndex: 2, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px 4px 6px", borderRadius: 99, background: "oklch(1 0 0 / .03)", border: "1px solid var(--line-2)", fontSize: 11, color: "var(--fg-2)", marginBottom: 32 }}>
          <span className="pill pill-ok" style={{ fontSize: 9, padding: "1px 7px" }}>v2.1</span>
          Multi-device mesh with ML-tuned routing
        </div>
        <h1 style={{ fontSize: 60, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, margin: "0 auto", maxWidth: 800 }}>
          Your personal<br />
          <span className="font-serif" style={{ color: "var(--accent)", fontSize: 64 }}>data courier</span>.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--fg-2)", maxWidth: 560, margin: "28px auto 0", fontWeight: 400 }}>
          Vinctum connects all your devices into a private encrypted mesh. Files move directly between them — no cloud, no intermediary, no trace left behind.
        </p>
        <div className="flex gap-3 justify-center mt-9">
          <Link to="/register" className="btn btn-primary" style={{ padding: "12px 20px", fontSize: 14 }}>
            Start free <ArrowRight size={14} />
          </Link>
          <Link to="/protocol" className="btn btn-ghost" style={{ padding: "12px 20px", fontSize: 14 }}>Read the protocol</Link>
        </div>
      </div>
    </section>
  );
}

function Architecture() {
  const services = [
    { name: "Identity", desc: "Auth, device management, pairing, friends", icon: Shield, color: "var(--accent)" },
    { name: "Discovery", desc: "P2P peer registry via libp2p Kademlia DHT", icon: Globe, color: "var(--cyan)" },
    { name: "Routing", desc: "ML-scored route computation, relay management", icon: Network, color: "var(--violet)" },
    { name: "Transfer", desc: "Chunk-based encrypted file transfer (P2P + relay)", icon: Zap, color: "var(--amber)" },
    { name: "Relay", desc: "Store-and-forward with circuit breaker failover", icon: RefreshCw, color: "var(--red)" },
    { name: "Gateway", desc: "REST-to-gRPC proxy for browser clients", icon: Cpu, color: "var(--cyan)" },
  ];

  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 80 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--accent)", marginBottom: 14 }}>Architecture</div>
            <h2 style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0 }}>
              Six microservices.<br /><span className="font-serif" style={{ color: "var(--fg-2)" }}>One mesh.</span>
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--fg-2)", marginTop: 20 }}>
              Each service owns a single responsibility. They communicate over gRPC with mTLS, and the Gateway exposes a REST API for web clients. All services are independently deployable and horizontally scalable.
            </p>
            <div className="flat-card" style={{ padding: "16px 18px", marginTop: 24 }}>
              <div className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)", marginBottom: 8 }}>STACK</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Go", "gRPC", "libp2p", "PostgreSQL", "Redis", "QUIC", "Protobuf"].map(t => (
                  <span key={t} className="chip">{t}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--line)", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
            {services.map(s => (
              <div key={s.name} style={{ background: "var(--bg)", padding: "24px 22px" }}>
                <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: `color-mix(in oklch, ${s.color}, transparent 90%)`, border: `1px solid color-mix(in oklch, ${s.color}, transparent 75%)`, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <s.icon size={15} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</span>
                </div>
                <p style={{ fontSize: 12.5, color: "var(--fg-2)", lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  const cases = [
    { title: "Personal file sync", desc: "Move photos, documents, and backups between your laptop, phone, and NAS without touching any cloud service. Your files never leave your network.", icon: Laptop },
    { title: "Team collaboration", desc: "Share sensitive project files with teammates over encrypted direct connections. Audit logs track every transfer for compliance.", icon: Network },
    { title: "Cross-platform transfer", desc: "Works across macOS, Windows, Linux, iOS, and Android. Pair once, transfer forever with zero configuration.", icon: Smartphone },
    { title: "Self-hosted infrastructure", desc: "Run vinctum-core on your own servers. Same binary, same protocol, full control over your data plane.", icon: Server },
  ];

  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)", background: "oklch(0.14 0.012 235)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--cyan)", marginBottom: 14 }}>Use cases</div>
          <h2 style={{ fontSize: 38, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.05, margin: 0 }}>
            Built for people who <span className="font-serif" style={{ color: "var(--fg-2)" }}>own their data</span>.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }}>
          {cases.map(c => (
            <div key={c.title} className="glass-card-static" style={{ padding: "32px 28px" }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: "oklch(0.78 0.15 160 / .08)", border: "1px solid oklch(0.78 0.15 160 / .2)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <c.icon size={18} />
              </div>
              <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em" }}>{c.title}</div>
              <p style={{ fontSize: 14, color: "var(--fg-2)", marginTop: 10, lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeviceSupport() {
  const devices = [
    { name: "macOS", detail: "Secure Enclave for Ed25519 keys", icon: Monitor },
    { name: "Windows", detail: "TPM-backed key storage", icon: Monitor },
    { name: "Linux", detail: "TPM 2.0 or software keyring", icon: Monitor },
    { name: "iOS", detail: "Secure Enclave + background sync", icon: Smartphone },
    { name: "Android", detail: "StrongBox Keymaster", icon: Smartphone },
    { name: "Self-hosted", detail: "Docker / bare metal, same binary", icon: Server },
  ];

  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--accent)", marginBottom: 14 }}>Platform support</div>
          <h2 style={{ fontSize: 38, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.05, margin: 0 }}>
            Every device. <span className="font-serif" style={{ color: "var(--fg-2)" }}>One mesh.</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--line)", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
          {devices.map(d => (
            <div key={d.name} style={{ background: "var(--bg)", padding: "28px 24px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "oklch(1 0 0 / .03)", border: "1px solid var(--line-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-2)", flexShrink: 0 }}>
                <d.icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{d.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OpenSource() {
  return (
    <section className="grid-bg" style={{ padding: "100px 40px", borderTop: "1px solid var(--line)", textAlign: "center", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 60% at 50% 40%, oklch(0.78 0.11 210 / .07), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
        <h2 style={{ fontSize: 44, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1, margin: 0 }}>
          Open protocol.<br /><span className="font-serif" style={{ color: "var(--cyan)", fontSize: 48 }}>Open source.</span>
        </h2>
        <p style={{ fontSize: 16, color: "var(--fg-2)", marginTop: 24, lineHeight: 1.55 }}>
          The core protocol is fully open. Audit every line of cryptography, every byte on the wire. Trust is verified, not assumed.
        </p>
        <div className="flex gap-3 justify-center mt-9">
          <Link to="/register" className="btn btn-primary" style={{ padding: "13px 22px", fontSize: 14 }}>Create free account <ArrowRight size={14} /></Link>
          <Link to="/docs" className="btn btn-ghost" style={{ padding: "13px 22px", fontSize: 14 }}>View documentation</Link>
        </div>
      </div>
    </section>
  );
}

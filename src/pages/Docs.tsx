import { ArrowRight, Terminal, Book, Server, Code, Zap, Shield, FileText } from "lucide-react";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

import ScrollSpy from "../components/ScrollSpy";

export default function Docs() {
  const spySections = [
    { id: "hero", label: "Docs" },
    { id: "quickstart", label: "Quick start" },
    { id: "sections", label: "Topics" },
    { id: "api", label: "API Reference" },
    { id: "selfhost", label: "Self-Hosting" }
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <PublicHeader />
      <ScrollSpy sections={spySections} />
      <div id="section-hero"><Hero /></div>
      <div id="section-quickstart"><QuickStart /></div>
      <div id="section-sections"><Sections /></div>
      <div id="section-api"><APIReference /></div>
      <div id="section-selfhost"><SelfHost /></div>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="mesh-bg grid-bg" style={{ padding: "120px 40px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", zIndex: 2, textAlign: "center" }}>
        <h1 style={{ fontSize: 60, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, margin: 0 }}>
          <span className="font-serif" style={{ color: "var(--cyan)", fontSize: 64 }}>Documentation</span>
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--fg-2)", maxWidth: 520, margin: "24px auto 0" }}>
          Everything you need to set up, configure, and extend Vinctum. From first transfer to self-hosted deployment.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <a href="#quickstart" className="btn btn-primary" style={{ padding: "12px 20px", fontSize: 14 }}>
            Quick start <ArrowRight size={14} />
          </a>
          <a href="#api" className="btn btn-ghost" style={{ padding: "12px 20px", fontSize: 14 }}>API reference</a>
        </div>
      </div>
    </section>
  );
}

function QuickStart() {
  const steps = [
    {
      n: "01", title: "Create an account",
      desc: "Sign up with email and verify your address. No credit card needed.",
      code: null,
    },
    {
      n: "02", title: "Register your device",
      desc: "Your browser automatically registers as a device on first login. For CLI:",
      code: `$ vinctum auth login
Email: sait@example.com
Password: ••••••••
✓ Logged in as sait
✓ Device "macbook-pro" registered`,
    },
    {
      n: "03", title: "Pair a second device",
      desc: "Generate a pairing code on one device and enter it on another.",
      code: `# On device A
$ vinctum pair generate
Pairing code: 847291 (expires in 5m)

# On device B
$ vinctum pair redeem 847291
✓ Paired with "macbook-pro"`,
    },
    {
      n: "04", title: "Send your first file",
      desc: "Select a file and a target device. Everything else is automatic.",
      code: `$ vinctum send report.pdf --to "iphone-15"
Encrypting... AES-256-GCM (384 chunks)
Transferring... ████████████████ 98 MB
✓ Complete in 2.1s · direct P2P`,
    },
  ];

  return (
    <section id="quickstart" style={{ padding: "100px 40px", borderTop: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--accent)", marginBottom: 14 }}>Quick start</div>
          <h2 style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0 }}>
            First transfer in <span className="font-serif" style={{ color: "var(--fg-2)" }}>under 5 minutes</span>.
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {steps.map(s => (
            <div key={s.n} style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 32, alignItems: "start" }}>
              <div>
                <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
                  <span className="font-mono" style={{ fontSize: 11, color: "var(--accent)" }}>{s.n}</span>
                  <span style={{ fontSize: 16, fontWeight: 500 }}>{s.title}</span>
                </div>
                <p style={{ fontSize: 13.5, color: "var(--fg-2)", lineHeight: 1.55, margin: 0 }}>{s.desc}</p>
              </div>
              {s.code && (
                <div className="flat-card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--line)", background: "oklch(0.12 0.012 235)", display: "flex", alignItems: "center", gap: 6 }}>
                    <Terminal size={11} style={{ color: "var(--muted)" }} />
                    <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)" }}>terminal</span>
                  </div>
                  <pre className="font-mono" style={{ margin: 0, padding: "16px 18px", fontSize: 11.5, lineHeight: 1.65, color: "var(--fg-2)", background: "oklch(0.13 0.012 235)" }}>
                    {s.code}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Sections() {
  const sections = [
    { title: "Getting Started", desc: "Installation, account setup, first device pairing, and your first transfer.", icon: Zap, color: "var(--accent)", links: ["Installation", "Account setup", "Device pairing", "First transfer"] },
    { title: "Core Concepts", desc: "Understand the mesh, device identity, sessions, and how transfers work under the hood.", icon: Book, color: "var(--cyan)", links: ["Device mesh", "Identity & keys", "Peer sessions", "Transfer lifecycle"] },
    { title: "Security", desc: "Key exchange protocol, threat model, encryption details, and hardware key storage.", icon: Shield, color: "var(--violet)", links: ["Key exchange", "Threat model", "Encryption", "Hardware keys"] },
    { title: "CLI Reference", desc: "Complete reference for the vinctum command-line interface with examples.", icon: Terminal, color: "var(--amber)", links: ["auth", "pair", "send", "devices", "sessions"] },
    { title: "API Reference", desc: "REST API endpoints exposed by the Gateway service for browser and third-party clients.", icon: Code, color: "var(--accent)", links: ["Authentication", "Devices", "Transfers", "Friends"] },
    { title: "Self-Hosting", desc: "Deploy vinctum-core on your own infrastructure with Docker or bare metal.", icon: Server, color: "var(--cyan)", links: ["Docker Compose", "Configuration", "TLS setup", "Scaling"] },
  ];

  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)", background: "oklch(0.14 0.012 235)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--cyan)", marginBottom: 14 }}>Documentation</div>
          <h2 style={{ fontSize: 38, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.05, margin: 0 }}>
            Explore by <span className="font-serif" style={{ color: "var(--fg-2)" }}>topic</span>.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {sections.map(s => (
            <div key={s.title} className="glass-card-static" style={{ padding: "28px 24px", display: "flex", flexDirection: "column" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `color-mix(in oklch, ${s.color}, transparent 90%)`, border: `1px solid color-mix(in oklch, ${s.color}, transparent 75%)`, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <s.icon size={16} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em" }}>{s.title}</div>
              <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 8, lineHeight: 1.55 }}>{s.desc}</p>
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 8 }}>
                {s.links.map(l => (
                  <span key={l} className="flex items-center gap-2" style={{ fontSize: 12.5, color: "var(--muted)", cursor: "pointer", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--fg-2)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
                    <FileText size={11} />{l}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function APIReference() {
  const endpoints = [
    { method: "POST", path: "/api/v1/auth/login", desc: "Authenticate with email and password", tag: "Auth" },
    { method: "POST", path: "/api/v1/auth/register", desc: "Create a new user account", tag: "Auth" },
    { method: "POST", path: "/api/v1/auth/refresh", desc: "Rotate access and refresh tokens", tag: "Auth" },
    { method: "GET", path: "/api/v1/devices", desc: "List all registered devices", tag: "Devices" },
    { method: "POST", path: "/api/v1/devices", desc: "Register a new device", tag: "Devices" },
    { method: "PUT", path: "/api/v1/devices/{id}/visibility", desc: "Set device public/private visibility", tag: "Devices" },
    { method: "POST", path: "/api/v1/transfers", desc: "Initiate a new file transfer", tag: "Transfers" },
    { method: "GET", path: "/api/v1/transfers", desc: "List all transfers with filters", tag: "Transfers" },
    { method: "POST", path: "/api/v1/transfers/{id}/chunks", desc: "Upload an encrypted chunk", tag: "Transfers" },
    { method: "POST", path: "/api/v1/friends/request", desc: "Send a friend request", tag: "Friends" },
    { method: "GET", path: "/api/v1/friends", desc: "List accepted friends", tag: "Friends" },
    { method: "GET", path: "/api/v1/friends/devices", desc: "List public devices of friends", tag: "Friends" },
  ];

  const methodColor: Record<string, string> = {
    GET: "var(--accent)",
    POST: "var(--cyan)",
    PUT: "var(--amber)",
    DELETE: "var(--red)",
  };

  return (
    <section id="api" style={{ padding: "100px 40px", borderTop: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--accent)", marginBottom: 14 }}>API reference</div>
          <h2 style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0 }}>
            REST <span className="font-serif" style={{ color: "var(--fg-2)" }}>endpoints</span>
          </h2>
          <p style={{ fontSize: 14, color: "var(--fg-2)", marginTop: 14, lineHeight: 1.6 }}>
            The Gateway service exposes all gRPC services as REST endpoints. All endpoints (except auth) require a Bearer token.
          </p>
        </div>
        <div className="flat-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr 80px", borderBottom: "1px solid var(--line)", background: "oklch(0.12 0.012 235)", padding: "10px 16px" }}>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>METHOD</span>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>ENDPOINT</span>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>DESCRIPTION</span>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)", textAlign: "right" }}>TAG</span>
          </div>
          {endpoints.map((e, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr 80px", padding: "11px 16px", borderBottom: i < endpoints.length - 1 ? "1px solid var(--line)" : "none", alignItems: "center" }}>
              <span className="font-mono" style={{ fontSize: 11, fontWeight: 600, color: methodColor[e.method] }}>{e.method}</span>
              <span className="font-mono" style={{ fontSize: 11.5, color: "var(--fg-2)" }}>{e.path}</span>
              <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{e.desc}</span>
              <span className="chip" style={{ justifyContent: "center", fontSize: 10 }}>{e.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SelfHost() {
  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)", background: "oklch(0.14 0.012 235)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 80, alignItems: "start" }}>
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--violet)", marginBottom: 14 }}>Self-hosting</div>
          <h2 style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0 }}>
            Your infrastructure.<br /><span className="font-serif" style={{ color: "var(--fg-2)" }}>Your rules.</span>
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--fg-2)", marginTop: 20 }}>
            Deploy all 6 microservices on your own hardware or cloud. Docker Compose makes it one command. Same binary, same protocol — zero vendor lock-in.
          </p>
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Requirements", value: "PostgreSQL 16, Redis 7, Docker (optional)" },
              { label: "Config", value: "Single YAML file + environment variables" },
              { label: "Migrations", value: "Embedded SQL, auto-applied on boot" },
              { label: "TLS", value: "mTLS supported via cert/key/CA paths" },
            ].map((r, i) => (
              <div key={r.label} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 14, paddingBottom: 12, borderBottom: i < 3 ? "1px solid var(--line)" : "none" }}>
                <span className="font-mono" style={{ fontSize: 10.5, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".05em" }}>{r.label}</span>
                <span style={{ fontSize: 13, color: "var(--fg-2)" }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flat-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", background: "oklch(0.12 0.012 235)", display: "flex", alignItems: "center", gap: 6 }}>
            <Terminal size={11} style={{ color: "var(--muted)" }} />
            <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)" }}>deploy.sh</span>
          </div>
          <pre className="font-mono" style={{ margin: 0, padding: "20px 22px", fontSize: 11.5, lineHeight: 1.7, color: "var(--fg-2)", background: "oklch(0.13 0.012 235)", overflow: "auto" }}>
{`# Clone the repository
$ git clone https://github.com/vinctum/vinctum-core
$ cd vinctum-core

# Configure environment
$ cp config/config.dev.yaml config/config.yaml
$ vim config/config.yaml

# Start all services
$ docker compose -f deployments/docker/docker-compose.yml up -d

# Verify
$ curl http://localhost:8080/health
{"status":"healthy","services":6}

# View logs
$ docker compose logs -f identity
identity | migrations applied: 16/16
identity | gRPC listening on :50051
identity | metrics at :51051/metrics`}
          </pre>
        </div>
      </div>
    </section>
  );
}

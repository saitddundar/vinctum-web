import { Link } from "react-router-dom";
import { ArrowRight, Shield, Lock, Eye, EyeOff, Server, Key, AlertTriangle, CheckCircle, FileSearch } from "lucide-react";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export default function Security() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <PublicHeader />
      <Hero />
      <ZeroKnowledge />
      <ThreatModel />
      <Practices />
      <Transparency />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="mesh-bg grid-bg" style={{ padding: "120px 40px 100px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", zIndex: 2, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px 4px 6px", borderRadius: 99, background: "oklch(1 0 0 / .03)", border: "1px solid var(--line-2)", fontSize: 11, color: "var(--fg-2)", marginBottom: 32 }}>
          <span className="pill pill-ok" style={{ fontSize: 9, padding: "1px 7px" }}>SECURITY</span>
          Zero-knowledge by design
        </div>
        <h1 style={{ fontSize: 60, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, margin: "0 auto", maxWidth: 800 }}>
          We can't read your files.<br />
          <span className="font-serif" style={{ color: "var(--accent)", fontSize: 64 }}>By design.</span>
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--fg-2)", maxWidth: 580, margin: "28px auto 0" }}>
          The server never holds decryption keys, never sees plaintext, and never stores your files. Security isn't a feature we added — it's the constraint we built around.
        </p>
      </div>
    </section>
  );
}

function ZeroKnowledge() {
  const comparisons = [
    { category: "File storage", them: "Stored on provider servers, encrypted with provider-held keys", us: "Never stored on any server. Direct device-to-device transfer only.", themIcon: Eye, usIcon: EyeOff },
    { category: "Encryption keys", them: "Generated and managed by the provider, accessible to support staff", us: "Generated on your device, never leave it. Ephemeral keys destroyed after each transfer.", themIcon: Server, usIcon: Key },
    { category: "Metadata", them: "Sender, receiver, file names, sizes, timestamps all visible to provider", us: "Server sees only encrypted chunk hashes. File names and contents are opaque.", themIcon: FileSearch, usIcon: Lock },
    { category: "Compliance request", them: "Provider can decrypt and hand over file contents", us: "We cannot comply — we don't have the keys. Mathematically impossible.", themIcon: AlertTriangle, usIcon: Shield },
  ];

  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--accent)", marginBottom: 14 }}>Zero-knowledge architecture</div>
          <h2 style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0 }}>
            Cloud transfer vs. <span className="font-serif" style={{ color: "var(--fg-2)" }}>Vinctum</span>.
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--line)", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
          {comparisons.map(c => (
            <div key={c.category} style={{ background: "var(--bg)", display: "grid", gridTemplateColumns: "160px 1fr 1fr", gap: 0 }}>
              <div style={{ padding: "24px 20px", borderRight: "1px solid var(--line)", display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{c.category}</span>
              </div>
              <div style={{ padding: "24px 20px", borderRight: "1px solid var(--line)", display: "flex", alignItems: "start", gap: 12 }}>
                <c.themIcon size={16} style={{ color: "var(--red)", flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.5 }}>{c.them}</span>
              </div>
              <div style={{ padding: "24px 20px", display: "flex", alignItems: "start", gap: 12 }}>
                <c.usIcon size={16} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.5 }}>{c.us}</span>
              </div>
            </div>
          ))}
          <div style={{ background: "var(--bg)", display: "grid", gridTemplateColumns: "160px 1fr 1fr" }}>
            <div style={{ padding: "14px 20px", borderRight: "1px solid var(--line)" }} />
            <div style={{ padding: "14px 20px", borderRight: "1px solid var(--line)" }}>
              <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".08em" }}>Typical cloud service</span>
            </div>
            <div style={{ padding: "14px 20px" }}>
              <span className="font-mono" style={{ fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".08em" }}>Vinctum</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ThreatModel() {
  const threats = [
    { id: "S-01", title: "Eavesdropping", status: "mitigated", desc: "All transfers encrypted with AES-256-GCM. Keys derived per-transfer via ECDH + HKDF. Even relay nodes see only ciphertext." },
    { id: "S-02", title: "Peer spoofing", status: "mitigated", desc: "AnnounceNode requires Ed25519 signature over (node_id || addrs || public_key). Unsigned announcements are rejected." },
    { id: "S-03", title: "MITM key exchange", status: "mitigated", desc: "Content hash covers the ephemeral public key. Receiver verifies the binding. Key substitution is detectable." },
    { id: "S-04", title: "Replay attacks", status: "mitigated", desc: "Per-chunk nonces derived from chunk index + transfer ID. Replay of old chunks is rejected by the Merkle verification." },
    { id: "S-05", title: "Server compromise", status: "mitigated", desc: "Server holds only ciphertext and encrypted metadata. No key material on server. Database breach yields nothing decryptable." },
    { id: "S-06", title: "Stolen device", status: "mitigated", desc: "Hardware-backed key storage (Secure Enclave, TPM, StrongBox). Device revocation propagates immediately via Identity service." },
  ];

  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)", background: "oklch(0.14 0.012 235)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--amber)", marginBottom: 14 }}>STRIDE threat model</div>
          <h2 style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0 }}>
            Every threat. <span className="font-serif" style={{ color: "var(--fg-2)" }}>Addressed.</span>
          </h2>
          <p style={{ fontSize: 14, color: "var(--fg-2)", marginTop: 16, maxWidth: 600, lineHeight: 1.6 }}>
            Our threat model follows the STRIDE methodology. Each identified threat has a concrete mitigation implemented in the protocol.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {threats.map(t => (
            <div key={t.id} className="flat-card" style={{ padding: "22px 20px" }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                <div className="flex items-center gap-3">
                  <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>{t.id}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{t.title}</span>
                </div>
                <span className="pill pill-ok" style={{ fontSize: 9 }}>
                  <CheckCircle size={10} /> MITIGATED
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--fg-2)", lineHeight: 1.55, margin: 0 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Practices() {
  const practices = [
    { title: "No key escrow", desc: "The server never generates, stores, or has access to any encryption key. Keys are created on-device and destroyed after use.", color: "var(--accent)" },
    { title: "Forward secrecy", desc: "Every transfer uses a fresh ephemeral X25519 keypair. Compromising a static key does not decrypt past transfers.", color: "var(--cyan)" },
    { title: "Signed announcements", desc: "Every peer announcement on the DHT is Ed25519-signed. Unsigned or invalid signatures are silently dropped.", color: "var(--violet)" },
    { title: "Hardware key storage", desc: "Private keys are stored in hardware security modules where available: Secure Enclave (Apple), StrongBox (Android), TPM (desktop).", color: "var(--amber)" },
    { title: "Audit logging", desc: "Every gRPC call is logged with user, method, status, peer address, and duration. Audit logs are immutable and queryable.", color: "var(--accent)" },
    { title: "Token rotation", desc: "Refresh tokens are single-use. Each refresh blacklists the old token and issues a new pair. Stolen tokens expire within minutes.", color: "var(--cyan)" },
  ];

  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--accent)", marginBottom: 14 }}>Security practices</div>
          <h2 style={{ fontSize: 38, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.05, margin: 0 }}>
            Defense in <span className="font-serif" style={{ color: "var(--fg-2)" }}>depth</span>.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--line)", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
          {practices.map(p => (
            <div key={p.title} style={{ background: "var(--bg)", padding: "28px 24px" }}>
              <div style={{ width: 3, height: 24, borderRadius: 2, background: p.color, marginBottom: 16 }} />
              <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>{p.title}</div>
              <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 9, lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Transparency() {
  return (
    <section className="grid-bg" style={{ padding: "100px 40px", borderTop: "1px solid var(--line)", textAlign: "center", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 60% at 50% 40%, oklch(0.78 0.15 160 / .07), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
        <h2 style={{ fontSize: 44, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1, margin: 0 }}>
          Security through<br /><span className="font-serif" style={{ color: "var(--accent)", fontSize: 48 }}>transparency</span>.
        </h2>
        <p style={{ fontSize: 16, color: "var(--fg-2)", marginTop: 24, lineHeight: 1.55 }}>
          Our protocol specification, threat model, and source code are all public. We believe security should be verifiable, not just promised.
        </p>
        <div className="flex gap-3 justify-center mt-9">
          <Link to="/protocol" className="btn btn-primary" style={{ padding: "13px 22px", fontSize: 14 }}>Read the protocol <ArrowRight size={14} /></Link>
          <Link to="/register" className="btn btn-ghost" style={{ padding: "13px 22px", fontSize: 14 }}>Get started</Link>
        </div>
      </div>
    </section>
  );
}

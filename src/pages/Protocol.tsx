import { Link } from "react-router-dom";
import { ArrowRight, Shield, Lock, Key, Layers, Wifi, FileCheck } from "lucide-react";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

import ScrollSpy from "../components/ScrollSpy";

export default function Protocol() {
  const spySections = [
    { id: "hero", label: "Protocol" },
    { id: "keyexchange", label: "Key exchange" },
    { id: "transfer", label: "Transfer" },
    { id: "transport", label: "Transport" },
    { id: "handshake", label: "Handshake" },
    { id: "cta", label: "Verify" }
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <PublicHeader />
      <ScrollSpy sections={spySections} />
      <div id="section-hero"><Hero /></div>
      <div id="section-keyexchange"><KeyExchange /></div>
      <div id="section-transfer"><TransferProtocol /></div>
      <div id="section-transport"><TransportLayer /></div>
      <div id="section-handshake"><Handshake /></div>
      <div id="section-cta"><CTA /></div>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="mesh-bg grid-bg" style={{ padding: "120px 40px 100px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", zIndex: 2, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px 4px 6px", borderRadius: 99, background: "oklch(1 0 0 / .03)", border: "1px solid var(--line-2)", fontSize: 11, color: "var(--fg-2)", marginBottom: 32 }}>
          <span className="pill pill-info" style={{ fontSize: 9, padding: "1px 7px" }}>PROTOCOL</span>
          Cryptography you can audit
        </div>
        <h1 style={{ fontSize: 60, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, margin: "0 auto", maxWidth: 800 }}>
          The cryptography is<br />
          <span className="font-serif" style={{ color: "var(--cyan)", fontSize: 64 }}>boring</span>.
          <span style={{ color: "var(--muted-2)" }}> That's the point.</span>
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--fg-2)", maxWidth: 580, margin: "28px auto 0" }}>
          No novel algorithms, no custom ciphers. Vinctum uses battle-tested primitives composed in a straightforward protocol that anyone can verify.
        </p>
      </div>
    </section>
  );
}

function KeyExchange() {
  const layers = [
    { label: "Identity", algo: "Ed25519", desc: "Each device generates a unique Ed25519 keypair on registration. The public key is bound to your user identity and signed by the root key. Used for signing announcements and verifying device authenticity.", color: "var(--accent)", icon: Shield },
    { label: "Session", algo: "X25519 ECDH", desc: "Each device registers a static X25519 public key. When a transfer begins, the sender generates an ephemeral X25519 keypair. The shared secret is derived via ECDH between the ephemeral private key and the receiver's static public key.", color: "var(--cyan)", icon: Key },
    { label: "Derivation", algo: "HKDF-SHA256", desc: "The raw ECDH output is fed into HKDF with salt = ephemeralPub || receiverStaticPub and info = 'vinctum-transfer-v1:<transfer_id>'. This produces a unique 256-bit AES key per transfer — even identical file contents produce different ciphertext.", color: "var(--violet)", icon: Lock },
  ];

  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--accent)", marginBottom: 14 }}>Key exchange</div>
          <h2 style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0 }}>
            Three layers of <span className="font-serif" style={{ color: "var(--fg-2)" }}>key material</span>.
          </h2>
          <p style={{ fontSize: 14, color: "var(--fg-2)", marginTop: 16, maxWidth: 600, lineHeight: 1.6 }}>
            Forward secrecy is guaranteed by ephemeral keys. Even if a device's static key is compromised, past transfers remain encrypted with keys that no longer exist.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--line)", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
          {layers.map((l, i) => (
            <div key={l.label} style={{ background: "var(--bg)", padding: "32px 28px", display: "grid", gridTemplateColumns: "200px 1fr", gap: 40, alignItems: "start" }}>
              <div>
                <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: `color-mix(in oklch, ${l.color}, transparent 90%)`, border: `1px solid color-mix(in oklch, ${l.color}, transparent 75%)`, color: l.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <l.icon size={15} />
                  </div>
                  <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>LAYER {i + 1}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{l.label}</div>
                <span className="chip chip-emerald" style={{ marginTop: 8 }}>{l.algo}</span>
              </div>
              <p style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.65, margin: 0, paddingTop: 4 }}>{l.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TransferProtocol() {
  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)", background: "oklch(0.14 0.012 235)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--violet)", marginBottom: 14 }}>Transfer protocol</div>
          <h2 style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0 }}>
            Chunked, encrypted,<br /><span className="font-serif" style={{ color: "var(--fg-2)" }}>verified</span>.
          </h2>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { step: "01", title: "Chunking", desc: "Files are split into 256 KB chunks before encryption. Each chunk is independently addressable and retransmittable." },
              { step: "02", title: "Encryption", desc: "Each chunk is encrypted with AES-256-GCM using a unique nonce derived from the chunk index. No two chunks share a nonce." },
              { step: "03", title: "Merkle tree", desc: "A Merkle tree is built over all ciphertext chunks. The root is signed by the sender's Ed25519 key." },
              { step: "04", title: "Verification", desc: "The receiver validates each chunk against the Merkle tree and verifies the root signature. Tampered chunks are rejected and re-requested." },
            ].map(s => (
              <div key={s.step} style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 14 }}>
                <span className="font-mono" style={{ fontSize: 11, color: "var(--muted-2)", paddingTop: 2 }}>{s.step}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{s.title}</div>
                  <p style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.55, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flat-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)", background: "oklch(0.12 0.012 235)", display: "flex", alignItems: "center", gap: 8 }}>
              <Layers size={12} style={{ color: "var(--muted)" }} />
              <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)" }}>chunk_layout.txt</span>
            </div>
            <pre className="font-mono" style={{ margin: 0, padding: "20px 22px", fontSize: 11, lineHeight: 1.7, color: "var(--fg-2)", background: "oklch(0.13 0.012 235)", overflow: "auto" }}>
{`┌─────────────────────────────────┐
│         FILE (raw bytes)        │
├────────┬────────┬───────────────┤
│ chunk0 │ chunk1 │ ... │ chunkN  │
│ 256 KB │ 256 KB │     │ <= 256  │
└───┬────┴───┬────┴─────┴───┬────┘
    │        │              │
    ▼        ▼              ▼
┌────────┬────────┬─────────────┐
│AES-GCM │AES-GCM │   AES-GCM  │
│nonce(0)│nonce(1)│   nonce(N)  │
└───┬────┴───┬────┴─────┴──┬───┘
    │        │             │
    ▼        ▼             ▼
  ┌──────────────────────────┐
  │      MERKLE TREE         │
  │                          │
  │    root (Ed25519 sig)    │
  │   /    \\       /    \\    │
  │  h01   h23   h45   hN   │
  │ / \\   / \\   / \\   / \\   │
  │h0 h1 h2 h3 h4 h5 ...hN │
  └──────────────────────────┘`}
            </pre>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
            <div className="flat-card" style={{ padding: "16px 18px" }}>
              <div className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)", marginBottom: 6 }}>CIPHER</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>AES-256-GCM</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>Per-chunk nonce derivation</div>
            </div>
            <div className="flat-card" style={{ padding: "16px 18px" }}>
              <div className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)", marginBottom: 6 }}>INTEGRITY</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Merkle + Ed25519</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>Signed root over ciphertext</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TransportLayer() {
  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--amber)", marginBottom: 14 }}>Transport</div>
          <h2 style={{ fontSize: 38, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.05, margin: 0 }}>
            Direct when possible. <span className="font-serif" style={{ color: "var(--fg-2)" }}>Relayed when necessary.</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {[
            { title: "NAT hole-punch", desc: "libp2p handles NAT traversal via AutoRelay and QUIC hole-punching. Direct connections succeed in 87% of home networks.", stat: "87%", statLabel: "Direct success rate", icon: Wifi, color: "var(--accent)" },
            { title: "Self-relay fallback", desc: "When direct connection fails, your own devices act as encrypted relays. Data never passes through third-party infrastructure.", stat: "0", statLabel: "Third-party relays", icon: Layers, color: "var(--cyan)" },
            { title: "Circuit breaker", desc: "Per-node circuit breakers detect failing relay paths and automatically reroute through healthier nodes. Background replication ensures redundancy.", stat: "<50ms", statLabel: "Failover time", icon: FileCheck, color: "var(--violet)" },
          ].map(t => (
            <div key={t.title} className="glass-card-static" style={{ padding: "28px 24px" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `color-mix(in oklch, ${t.color}, transparent 90%)`, border: `1px solid color-mix(in oklch, ${t.color}, transparent 75%)`, color: t.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <t.icon size={16} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>{t.title}</div>
              <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 9, lineHeight: 1.6 }}>{t.desc}</p>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                <div className="font-mono" style={{ fontSize: 22, fontWeight: 500, color: t.color }}>{t.stat}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{t.statLabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Handshake() {
  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)", background: "oklch(0.14 0.012 235)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--cyan)", marginBottom: 14 }}>Wire format</div>
          <h2 style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0 }}>
            Handshake <span className="font-serif" style={{ color: "var(--fg-2)" }}>sequence</span>
          </h2>
        </div>
        <div className="flat-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--line)", background: "oklch(0.12 0.012 235)", display: "flex", alignItems: "center", gap: 8 }}>
            <div className="flex gap-1.5">{["oklch(0.72 0.17 25 / .4)","oklch(0.84 0.13 85 / .4)","oklch(0.78 0.15 160 / .5)"].map(c=><span key={c} style={{width:10,height:10,borderRadius:99,background:c}}/>)}</div>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)" }}>handshake.log</span>
          </div>
          <pre className="font-mono" style={{ margin: 0, padding: "24px 26px", fontSize: 11.5, lineHeight: 1.75, color: "var(--fg-2)", background: "oklch(0.13 0.012 235)", overflow: "auto" }}>
{`// 1. Device discovery via Kademlia DHT
DISCOVER  node:"8f3a…c4b1" → DHT lookup
FOUND     node:"a12e…9f34" addrs:[/ip4/…/udp/4001/quic-v1]

// 2. Mutual authentication
→ HELLO   { node: "8f3a…c4b1", vsn: 2.1, sig: Ed25519 }
← HELLO   { node: "a12e…9f34", vsn: 2.1, sig: Ed25519 }
VERIFY    signatures ✓

// 3. Ephemeral X25519 key exchange
→ EPUB    0xa7f2e1b9c4d8…0f3e  (sender ephemeral pub)
← ACK     receiver static pub confirmed

// 4. Key derivation
ECDH      shared = X25519(ephPriv, recvStaticPub)
HKDF      salt = ephPub || recvStaticPub
           info = "vinctum-transfer-v1:<tid>"
           key  = 256-bit AES key ✓

// 5. Chunked transfer
→ CHUNK   #0001/0384  256 KB  AES-256-GCM  nonce(0)
→ CHUNK   #0002/0384  256 KB  AES-256-GCM  nonce(1)
  …
→ CHUNK   #0384/0384   64 KB  AES-256-GCM  nonce(383)

// 6. Integrity verification
→ MROOT   0xf4a1…9c27  sig: Ed25519(sender)
← VERIFY  merkle root ✓  signature ✓
COMPLETE  98 MB in 2.1s · direct P2P`}
          </pre>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="grid-bg" style={{ padding: "100px 40px", borderTop: "1px solid var(--line)", textAlign: "center", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 60% at 50% 40%, oklch(0.78 0.11 210 / .07), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 600, margin: "0 auto", position: "relative" }}>
        <h2 style={{ fontSize: 40, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0 }}>
          Don't trust us.<br /><span className="font-serif" style={{ color: "var(--cyan)", fontSize: 44 }}>Verify.</span>
        </h2>
        <p style={{ fontSize: 15, color: "var(--fg-2)", marginTop: 20, lineHeight: 1.55 }}>
          Every cryptographic operation is auditable. The protocol is open, the code is open, and the math is standard.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Link to="/security" className="btn btn-primary" style={{ padding: "12px 20px", fontSize: 14 }}>Security model <ArrowRight size={14} /></Link>
          <Link to="/docs" className="btn btn-ghost" style={{ padding: "12px 20px", fontSize: 14 }}>Read the docs</Link>
        </div>
      </div>
    </section>
  );
}

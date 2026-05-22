import { Link } from "react-router-dom";
import { Check, ArrowRight, Minus } from "lucide-react";
import { useState } from "react";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export default function Pricing() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <PublicHeader />
      <Hero />
      <Tiers />
      <Comparison />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="mesh-bg grid-bg" style={{ padding: "120px 40px 60px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", zIndex: 2, textAlign: "center" }}>
        <h1 style={{ fontSize: 60, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, margin: 0 }}>
          Simple. <span className="font-serif" style={{ color: "var(--accent)", fontSize: 64 }}>Honest.</span>
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--fg-2)", maxWidth: 480, margin: "24px auto 0" }}>
          We don't meter bandwidth — you're not using ours. Pay for features, not for bytes you already own.
        </p>
      </div>
    </section>
  );
}

function Tiers() {
  const tiers = [
    {
      name: "Personal", price: "Free", sub: "forever",
      features: [
        "Up to 5 devices",
        "Unlimited transfer size",
        "Unlimited bandwidth",
        "E2E encryption",
        "Community support",
        "Self-host optional",
      ],
      cta: "Start free", ctaTo: "/register",
    },
    {
      name: "Pro", price: "$6", sub: "per month",
      features: [
        "Unlimited devices",
        "Priority relay pool",
        "Family sharing (up to 6)",
        "Mobile background sync",
        "Scheduled transfers",
        "Email support",
      ],
      cta: "Try Pro free", ctaTo: "/register", highlight: true,
    },
    {
      name: "Team", price: "$12", sub: "per user / mo",
      features: [
        "Everything in Pro",
        "SSO / SCIM provisioning",
        "Audit log export",
        "Policy controls",
        "99.9% SLA",
        "Dedicated relay region",
      ],
      cta: "Contact sales", ctaTo: "/register",
    },
  ];

  return (
    <section style={{ padding: "60px 40px 100px" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {tiers.map(t => (
            <div key={t.name} className={t.highlight ? "glass-card-static" : "flat-card"} style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20, ...(t.highlight ? { border: "1px solid oklch(0.78 0.15 160 / .3)", boxShadow: "0 0 0 1px oklch(0.78 0.15 160 / .15), 0 20px 60px rgba(0,0,0,.3)" } : {}) }}>
              {t.highlight && (
                <div style={{ position: "relative", marginTop: -8, marginBottom: -8 }}>
                  <span className="pill pill-ok" style={{ fontSize: 9 }}>MOST POPULAR</span>
                </div>
              )}
              <div>
                <div style={{ fontSize: 14, color: "var(--fg-2)", fontWeight: 500 }}>{t.name}</div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span style={{ fontSize: 40, fontWeight: 500, letterSpacing: "-0.02em" }}>{t.price}</span>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{t.sub}</span>
                </div>
              </div>
              <div style={{ height: 1, background: "var(--line)" }} />
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
                {t.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5" style={{ fontSize: 13.5, color: "var(--fg-2)" }}>
                    <Check size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <Link to={t.ctaTo} className={`btn ${t.highlight ? "btn-primary" : "btn-ghost"}`} style={{ justifyContent: "center", padding: "11px 16px" }}>{t.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const features = [
    { name: "Devices", personal: "5", pro: "Unlimited", team: "Unlimited" },
    { name: "Transfer size", personal: "Unlimited", pro: "Unlimited", team: "Unlimited" },
    { name: "Bandwidth", personal: "Unlimited", pro: "Unlimited", team: "Unlimited" },
    { name: "E2E encryption", personal: true, pro: true, team: true },
    { name: "P2P direct transfer", personal: true, pro: true, team: true },
    { name: "Self-host", personal: true, pro: true, team: true },
    { name: "Priority relay", personal: false, pro: true, team: true },
    { name: "Family sharing", personal: false, pro: "Up to 6", team: "Org-wide" },
    { name: "Background sync", personal: false, pro: true, team: true },
    { name: "Scheduled transfers", personal: false, pro: true, team: true },
    { name: "SSO / SCIM", personal: false, pro: false, team: true },
    { name: "Audit log export", personal: false, pro: false, team: true },
    { name: "Policy controls", personal: false, pro: false, team: true },
    { name: "SLA", personal: false, pro: false, team: "99.9%" },
    { name: "Support", personal: "Community", pro: "Email", team: "Dedicated" },
  ];

  const renderCell = (v: boolean | string) => {
    if (v === true) return <Check size={14} style={{ color: "var(--accent)" }} />;
    if (v === false) return <Minus size={14} style={{ color: "var(--muted-2)" }} />;
    return <span style={{ fontSize: 13, color: "var(--fg-2)" }}>{v}</span>;
  };

  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)", background: "oklch(0.14 0.012 235)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--cyan)", marginBottom: 14 }}>Compare plans</div>
          <h2 style={{ fontSize: 34, fontWeight: 500, letterSpacing: "-0.025em", margin: 0 }}>
            Feature <span className="font-serif" style={{ color: "var(--fg-2)" }}>breakdown</span>
          </h2>
        </div>
        <div className="flat-card" style={{ overflow: "hidden", padding: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 120px", borderBottom: "1px solid var(--line)", background: "oklch(0.12 0.012 235)" }}>
            <div style={{ padding: "14px 20px" }}>
              <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".08em" }}>Feature</span>
            </div>
            {["Personal", "Pro", "Team"].map(t => (
              <div key={t} style={{ padding: "14px 16px", textAlign: "center", borderLeft: "1px solid var(--line)" }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: t === "Pro" ? "var(--accent)" : "var(--fg-2)" }}>{t}</span>
              </div>
            ))}
          </div>
          {features.map((f, i) => (
            <div key={f.name} style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 120px", borderBottom: i < features.length - 1 ? "1px solid var(--line)" : "none" }}>
              <div style={{ padding: "12px 20px" }}>
                <span style={{ fontSize: 13, color: "var(--fg-2)" }}>{f.name}</span>
              </div>
              {[f.personal, f.pro, f.team].map((v, j) => (
                <div key={j} style={{ padding: "12px 16px", textAlign: "center", borderLeft: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {renderCell(v)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Why is bandwidth unlimited on all plans?", a: "Your files travel directly between your devices — they never pass through our servers. We don't pay for your bandwidth, so we don't charge for it." },
    { q: "What happens if I downgrade from Pro?", a: "You keep all your paired devices, but only the 5 most recently active will sync. No data is deleted. Upgrade again anytime to restore full access." },
    { q: "Can I self-host and still use the free plan?", a: "Yes. vinctum-core is open source and self-hostable on all plans. The free plan includes full protocol support with no artificial limits on the self-hosted binary." },
    { q: "How does family sharing work?", a: "Pro subscribers can invite up to 6 family members. Each member gets their own account and device mesh, but can share files across the family group with one tap." },
    { q: "What's included in the Team SLA?", a: "99.9% uptime for relay infrastructure and the Identity/Discovery services. Direct P2P transfers are not covered by SLA since they depend on your network." },
    { q: "Do you offer annual billing?", a: "Yes. Annual billing gives you 2 months free — $60/year for Pro and $120/user/year for Team." },
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <section style={{ padding: "100px 40px", borderTop: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--accent)", marginBottom: 14 }}>FAQ</div>
          <h2 style={{ fontSize: 34, fontWeight: 500, letterSpacing: "-0.025em", margin: 0 }}>
            Common <span className="font-serif" style={{ color: "var(--fg-2)" }}>questions</span>
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderBottom: "1px solid var(--line)" }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", padding: "20px 0", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--fg)", fontFamily: "Inter, sans-serif" }}
              >
                <span style={{ fontSize: 15, fontWeight: 450, textAlign: "left" }}>{f.q}</span>
                <span style={{ fontSize: 18, color: "var(--muted)", flexShrink: 0, marginLeft: 16, transition: "transform 0.2s", transform: open === i ? "rotate(45deg)" : "none" }}>+</span>
              </button>
              {open === i && (
                <p style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.6, margin: 0, paddingBottom: 20 }}>{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="grid-bg" style={{ padding: "100px 40px", borderTop: "1px solid var(--line)", textAlign: "center", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 60% at 50% 40%, oklch(0.78 0.15 160 / .07), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 600, margin: "0 auto", position: "relative" }}>
        <h2 style={{ fontSize: 40, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0 }}>
          Start free.<br /><span className="font-serif" style={{ color: "var(--accent)", fontSize: 44 }}>Scale when ready.</span>
        </h2>
        <p style={{ fontSize: 15, color: "var(--fg-2)", marginTop: 20, lineHeight: 1.55 }}>
          5 devices, unlimited transfers, full encryption. No credit card required.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Link to="/register" className="btn btn-primary" style={{ padding: "13px 22px", fontSize: 14 }}>Create free account <ArrowRight size={14} /></Link>
        </div>
      </div>
    </section>
  );
}

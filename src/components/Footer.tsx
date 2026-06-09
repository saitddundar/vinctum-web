import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", padding: "56px 40px 32px", background: "oklch(0.13 0.012 235)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(4,1fr)", gap: 40, paddingBottom: 40, borderBottom: "1px solid var(--line)" }}>
          <div style={{ marginBottom: 20 }}>
            <Link to="/" className="flex items-center gap-2" style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.02em", color: "var(--fg)", textDecoration: "none" }}>
              vinctum
            </Link>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 14, lineHeight: 1.6, maxWidth: 240 }}>Zero-knowledge file transfer between your own devices. Built in Istanbul.</p>
          </div>
          {[
            { title: "Product", links: [
              { label: "Features", to: "/product" },
              { label: "Protocol", to: "/protocol" },
              { label: "Security", to: "/security" },
              { label: "Pricing", to: "/pricing" },
            ]},
            { title: "Developers", links: [
              { label: "Docs", to: "/docs" },
              { label: "API Reference", to: "/docs" },
              { label: "CLI", to: "/docs" },
              { label: "Self-host", to: "/docs" },
            ]},
            { title: "Company", links: [
              { label: "About", to: "/product" },
              { label: "Blog", to: "/docs" },
              { label: "Careers", to: "/product" },
              { label: "Contact", to: "/product" },
            ]},
            { title: "Legal", links: [
              { label: "Privacy", to: "/security" },
              { label: "Terms", to: "/security" },
              { label: "Security.txt", to: "/security" },
            ]},
          ].map(c => (
            <div key={c.title}>
              <div style={{ fontSize: 10.5, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 600, marginBottom: 14 }}>{c.title}</div>
              <div className="flex flex-col gap-2.5">
                {c.links.map(l => (
                  <Link key={l.label} to={l.to} style={{ fontSize: 13, color: "var(--fg-2)", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--fg)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--fg-2)")}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-6" style={{ fontSize: 11.5, color: "var(--muted-2)" }}>
          <span>&copy; 2026 Vinctum Labs</span>
          <span className="font-mono">build 2.1.3 &middot; f4a1c27</span>
        </div>
      </div>
    </footer>
  );
}

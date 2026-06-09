import { useState, useEffect } from "react";

export interface SpySection {
  id: string;
  label: string;
}

export default function ScrollSpy({ sections }: { sections: SpySection[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 2.5;
      let current = 0;
      sections.forEach((s, i) => {
        const el = document.getElementById(`section-${s.id}`);
        if (el && el.offsetTop <= scrollPos) {
          current = i;
        }
      });
      setActive(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  if (!sections || sections.length === 0) return null;

  return (
    <div className="hidden md:flex flex-col" style={{ position: "fixed", right: 32, top: "50%", transform: "translateY(-50%)", zIndex: 50, gap: 12 }}>
      {sections.map((s, i) => (
        <button
          key={s.id}
          onClick={() => document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: "smooth" })}
          style={{
            width: i === active ? 24 : 14, 
            height: 2, 
            background: i === active ? "var(--fg)" : "var(--muted)", 
            border: "none", cursor: "pointer", 
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            padding: 0, margin: "0 0 0 auto",
            opacity: i === active ? 1 : 0.3,
            borderRadius: 2
          }}
          title={s.label}
        />
      ))}
    </div>
  );
}

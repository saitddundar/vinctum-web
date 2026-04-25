import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthShellProps {
  title: ReactNode;
  sub?: string;
  step?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: ReactNode;
}

function Logo() {
  return (
    <Link to="/" className="text-[18px] font-semibold tracking-tight" style={{ color: "var(--fg)" }}>
      vinctum
    </Link>
  );
}

export default function AuthShell({ title, sub, step, children, footer, side }: AuthShellProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div
        className="w-full max-w-[1280px] overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]"
        style={{
          borderRadius: 16,
          border: "1px solid var(--line)",
          minHeight: 720,
          maxHeight: 820,
        }}
      >
        {/* Form side */}
        <div
          className="relative flex flex-col"
          style={{ padding: "48px 56px", background: "var(--bg)" }}
        >
          <div className="flex items-center justify-between">
            <Logo />
            {step && (
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                {step}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-[420px] w-full mx-auto">
            <div className="mb-9">
              <h1
                className="text-[34px] font-medium leading-tight tracking-tight m-0"
                style={{ color: "var(--fg)" }}
              >
                {title}
              </h1>
              {sub && (
                <p
                  className="text-[14.5px] mt-3 leading-relaxed"
                  style={{ color: "var(--fg-2)" }}
                >
                  {sub}
                </p>
              )}
            </div>
            {children}
          </div>

          {footer && <div className="mt-auto pt-4">{footer}</div>}
        </div>

        {/* Side art */}
        <div
          className="hidden lg:block relative overflow-hidden grid-bg"
          style={{
            background: "oklch(0.14 0.012 235)",
            borderLeft: "1px solid var(--line)",
          }}
        >
          {side}
        </div>
      </div>
    </div>
  );
}

/* Reusable side quote panel */
export function SideQuote({
  quote,
  caption,
  visual,
}: {
  quote: string;
  caption: string;
  visual?: ReactNode;
}) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: 56 }}>
      <div>{visual}</div>
      <div>
        <div
          className="text-[26px] leading-snug tracking-tight font-normal max-w-[460px]"
          style={{ color: "var(--fg)" }}
        >
          <span className="serif" style={{ color: "var(--accent)" }}>"</span>
          {quote}
          <span className="serif" style={{ color: "var(--accent)" }}>"</span>
        </div>
        <div
          className="text-xs mt-[18px] tracking-wide"
          style={{ color: "var(--muted)" }}
        >
          {caption}
        </div>
      </div>
    </div>
  );
}

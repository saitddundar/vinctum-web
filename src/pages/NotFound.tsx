import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center" style={{ background: "var(--bg)" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, oklch(0.78 0.15 160 / .06), transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", textAlign: "center", maxWidth: 480, padding: "0 32px" }}>
        <div className="font-mono" style={{ fontSize: 160, fontWeight: 400, letterSpacing: "-0.06em", lineHeight: 0.9, background: "linear-gradient(180deg, var(--fg) 0%, var(--muted-2) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 32 }}>
          404
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em", margin: "0 0 14px" }}>
          This path doesn't <span className="font-serif" style={{ color: "var(--accent)" }}>route.</span>
        </h1>
        <p style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.55, marginBottom: 28 }}>
          The page you asked for isn't in the mesh. It may have been moved, or the link was mangled somewhere along the way.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={14} /> Back home
          </Link>
          <Link to="/dashboard" className="btn btn-ghost">Dashboard</Link>
        </div>
        <div className="font-mono" style={{ fontSize: 11, color: "var(--muted-2)", marginTop: 36, letterSpacing: ".04em" }}>
          trace-id: req_f4a1c27_9e3d
        </div>
      </div>
    </div>
  );
}

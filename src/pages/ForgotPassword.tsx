import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../lib/auth-api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="bg-orb bg-orb-emerald" style={{ top: "30%", right: "25%" }} />
        </div>

        <div className="relative w-full max-w-sm space-y-6 text-center">
          <div>
            <h1 className="text-2xl font-semibold text-white">vinctum</h1>
            <p className="text-gray-400 text-sm mt-1">Check your email</p>
          </div>

          <div className="glass-card-static p-6 space-y-3">
            <p className="text-sm text-gray-300">
              If an account exists for <span className="text-gray-100">{email}</span>, we sent a password reset link.
            </p>
            <p className="text-xs text-gray-500">
              The link expires in 30 minutes. Check your spam folder if you don't see it.
            </p>
          </div>

          <Link to="/login" className="inline-block text-sm text-gray-400 hover:text-gray-300 transition-colors">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="bg-orb bg-orb-emerald" style={{ top: "20%", right: "25%" }} />
        <div className="bg-orb bg-orb-violet" style={{ bottom: "30%", left: "20%" }} />
      </div>

      <div className="relative w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white">vinctum</h1>
          <p className="text-gray-400 text-sm mt-1">Reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card-static p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-400 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              placeholder="you@example.com"
            />
            <p className="text-xs text-gray-600 mt-1.5">
              Enter the email associated with your account and we'll send a reset link.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-gray-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Remember your password?{" "}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

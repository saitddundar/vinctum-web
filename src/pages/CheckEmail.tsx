import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resendVerification } from "../lib/auth-api";

export default function CheckEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    if (!email) return;
    setLoading(true);
    try {
      await resendVerification(email);
      setResent(true);
    } catch {
      // silent fail — don't reveal if email exists
      setResent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <h1 className="text-2xl font-semibold text-white">vinctum</h1>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 space-y-4">
          <p className="text-white font-medium">Check your email</p>
          <p className="text-sm text-gray-400">
            We sent a verification link to{" "}
            <span className="text-white">{email}</span>. Click the link to
            activate your account.
          </p>

          {resent ? (
            <p className="text-sm text-emerald-400">Verification email resent!</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading || !email}
              className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Resend verification email"}
            </button>
          )}
        </div>

        <Link to="/login" className="text-sm text-gray-400 hover:text-gray-300">
          Back to login
        </Link>
      </div>
    </div>
  );
}

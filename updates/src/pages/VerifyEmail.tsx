import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../lib/auth-api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token");
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatus(res.success ? "success" : "error");
        setMessage(res.message);
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed. The link may have expired.");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <h1 className="text-2xl font-semibold text-white">vinctum</h1>

        {status === "loading" && (
          <p className="text-gray-400">Verifying your email...</p>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="rounded-md bg-emerald-900/50 border border-emerald-800 px-4 py-3 text-sm text-emerald-300">
              {message}
            </div>
            <Link
              to="/login"
              className="inline-block rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="rounded-md bg-red-900/50 border border-red-800 px-4 py-3 text-sm text-red-300">
              {message}
            </div>
            <Link
              to="/login"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

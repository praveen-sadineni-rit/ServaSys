"use client";

import { useState, type FormEvent } from "react";
import { FileText, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DEMO_COOKIE_NAME } from "../_lib/authMode";

type Mode = "signin" | "signup";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

function setDemoCookie(email: string) {
  // 7-day demo session cookie, readable by the server page via next/headers.
  document.cookie = `${DEMO_COOKIE_NAME}=${encodeURIComponent(email)}; path=/Timesheet; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export default function AuthCard({ demoMode }: { demoMode: boolean }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmailNotice, setCheckEmailNotice] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (demoMode) {
        // No Supabase configured — accept any credentials and start a local session.
        setDemoCookie(email);
        window.location.assign("/Timesheet");
        return;
      }
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        window.location.assign("/Timesheet");
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/Timesheet/auth/callback` },
        });
        if (signUpError) throw signUpError;
        setCheckEmailNotice(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    if (demoMode) {
      setDemoCookie(email || "demo.user@gmail.com");
      window.location.assign("/Timesheet");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/Timesheet/auth/callback` },
    });
  }

  async function handleForgotPassword() {
    if (demoMode) {
      setError("Demo mode — password reset isn’t needed. Any email and password will sign you in.");
      return;
    }
    if (!email) {
      setError("Enter your email above first, then click “Forgot password?”");
      return;
    }
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    if (resetError) setError(resetError.message);
    else setCheckEmailNotice(true);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-8 shadow-xl shadow-black/5">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-timesheetRust text-white">
          <FileText size={26} />
        </div>
        <h1 style={{ fontFamily: "var(--font-playfair)" }} className="text-3xl font-bold text-[#1a1a1a]">
          Timesheet <span className="italic text-timesheetRust">Splitter</span>
        </h1>
        <p className="mt-2 text-sm text-gray-600">Sign in to split your weekly hours</p>
      </div>

      {checkEmailNotice ? (
        <div className="mt-6 rounded-lg border border-timesheetRust/20 bg-timesheetCream px-4 py-3 text-sm text-[#1a1a1a]">
          Check your email for a confirmation/reset link, then come back and sign in.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-timesheetRust focus:outline-none focus:ring-2 focus:ring-timesheetRust/20"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-16 text-sm focus:border-timesheetRust focus:outline-none focus:ring-2 focus:ring-timesheetRust/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs font-medium text-gray-500 hover:text-timesheetRust"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {mode === "signin" && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-timesheetRust focus:ring-timesheetRust"
                />
                Remember me
              </label>
              <button type="button" onClick={handleForgotPassword} className="font-medium text-timesheetRust hover:underline">
                Forgot password?
              </button>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-timesheetRust py-3 text-sm font-semibold text-white transition hover:bg-timesheetRustDark disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            or
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-[#1a1a1a] transition hover:bg-gray-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-600">
            {mode === "signin" ? (
              <>
                New here?{" "}
                <button type="button" onClick={() => setMode("signup")} className="font-medium text-timesheetRust hover:underline">
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("signin")} className="font-medium text-timesheetRust hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>

          {demoMode && (
            <p className="border-t border-dashed border-gray-200 pt-4 text-center text-xs text-gray-500">
              Demo mode — any email + password works. Connect a Supabase project to enable real accounts.
            </p>
          )}
        </form>
      )}
    </div>
  );
}

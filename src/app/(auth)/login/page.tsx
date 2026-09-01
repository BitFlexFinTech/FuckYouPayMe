"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [totpCode, setTotpCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        totp: totpCode || undefined,
        redirect: false,
      });

      if (result?.error === "TOTP_REQUIRED") {
        setRequiresTotp(true);
        setLoading(false);
        return;
      }

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-3xl font-black uppercase tracking-tighter">
            <span className="text-pink-500">FYPM</span>
          </div>
          <p className="text-zinc-500 text-sm mt-2 font-mono">Sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">
              Email
            </label>
            <input
              className="brutal-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={requiresTotp}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">
              Password
            </label>
            <input
              className="brutal-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={requiresTotp}
            />
          </div>

          {requiresTotp && (
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">
                Two-Factor Code
              </label>
              <input
                className="brutal-input"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                required
                autoFocus
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="brutal-btn-primary w-full py-4 text-sm disabled:opacity-50"
          >
            {loading ? "Signing in…" : requiresTotp ? "Verify Code →" : "→ Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600 mt-6 font-mono">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-pink-400 hover:text-pink-300">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
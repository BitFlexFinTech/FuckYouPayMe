"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      // These are re-submitted from the stored flow
      email: (e.target as any).email.value,
      password: (e.target as any).password.value,
      totp: code,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid code. Try again.");
      setLoading(false);
    } else if (result?.ok) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-3xl font-black uppercase tracking-tighter">
            <span className="text-pink-500">FYPM</span>
          </div>
          <p className="text-zinc-500 text-sm mt-2 font-mono">Two-Factor Authentication</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">
              Authentication Code
            </label>
            <input
              className="brutal-input text-center text-2xl tracking-[0.5em]"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading} className="brutal-btn-primary w-full py-4 text-sm disabled:opacity-50">
            {loading ? "Verifying…" : "→ Verify & Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
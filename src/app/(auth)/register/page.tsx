"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/onboarding");
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
          <p className="text-zinc-500 text-sm mt-2 font-mono">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">
              Name
            </label>
            <input
              className="brutal-input"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">
              Password
            </label>
            <input
              className="brutal-input"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="brutal-btn-primary w-full py-4 text-sm disabled:opacity-50"
          >
            {loading ? "Creating account…" : "→ Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600 mt-6 font-mono">
          Already have an account?{" "}
          <Link href="/login" className="text-pink-400 hover:text-pink-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
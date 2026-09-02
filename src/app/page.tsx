"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const FEATURES = [
  {
    icon: "📤",
    title: "Send the Invoice",
    desc: "Type it up, hit send. They get a link. They pay with card, bank transfer, or crypto. No account needed. No friction. No excuses.",
  },
  {
    icon: "📩",
    title: "We Chase Them for You",
    desc: "Day 3: 'Hey, just a reminder.' Day 7: 'This is getting awkward.' Day 14: 'I'm done being nice.' Day 30: 'I'm going to court.' You pick how far we go. We send every single email.",
  },
  {
    icon: "💰",
    title: "We Take 2.5%. You Keep the Rest.",
    desc: "That's the whole price. No tiers. No 'contact us for enterprise pricing.' No fine print. You get paid, we eat, everyone moves on.",
  },
  {
    icon: "🖕",
    title: "The Fuck You Button",
    desc: "Client ghosting you? Hit the button. We send the next email right now. Or write your own — we'll send that too. This is the part people screenshot.",
  },
];
const DEMO_USERS: { name: string; email: string; role: string; label: string; accent: string }[] = [
  {
    name: "Maya Chen",
    email: "maya@fuckyoupayme.online",
    role: "freelancer",
    label: "Login as Freelancer (Maya)",
    accent: "border-pink-500 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20",
  },
  {
    name: "Platform Admin",
    email: "admin@fuckyoupayme.online",
    role: "admin",
    label: "Login as Platform Admin",
    accent: "border-zinc-400 bg-white/5 text-zinc-300 hover:bg-white/10",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const [demoError, setDemoError] = useState("");

  const handleDemoLogin = async (user: (typeof DEMO_USERS)[0]) => {
    setDemoError("");
    try {
      const result = await signIn("credentials", {
        email: user.email,
        password: "demo1234",
        redirect: false,
      });
      if (result?.ok) {
        router.push(user.role === "admin" ? "/admin" : "/dashboard");
        router.refresh();
      } else {
        setDemoError("Login failed: " + (result?.error || "Unknown error"));
      }
    } catch (e) {
      setDemoError("Login error: " + String(e));
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {showDemoBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.2em] text-pink-400 font-medium">
                🔥 Investor Demo Mode
              </span>
              <span className="hidden sm:inline text-xs text-zinc-500">— Instant one-click access</span>
            </div>
            <div className="flex items-center gap-3">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.role}
                  onClick={() => handleDemoLogin(u)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${u.accent}`}
                >
                  {u.label}
                </button>
              ))}
              {demoError && <span className="text-red-400 text-xs font-mono">{demoError}</span>}
              <button onClick={() => setShowDemoBanner(false)} className="text-zinc-500 hover:text-white text-sm ml-2">✕</button>
            </div>
          </div>
        </div>
      )}
      <div className={showDemoBanner ? "pt-[68px]" : ""} />
<section className="relative min-h-[80vh] flex flex-col justify-center px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[150px] blur-[150px] pointer-events-none" />
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 text-xs font-mono font-bold uppercase tracking-widest border border-pink-500/30 text-pink-400 bg-pink-500/5">
              v1.0 · Ephemeral Vault Escrow
            </span>
          </div>
          <h1 className="select-none">
            <div className="text-7xl sm:text-8xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-white">
              <span className="text-pink-500">FUCK</span> YOU.
            </div>
            <div className="text-7xl sm:text-8xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mt-2">
              PAY <span className="text-pink-500">ME.</span>
            </div>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-light max-w-2xl mt-8 leading-relaxed tracking-tight">
            You did the work. They didn&apos;t pay. We fix that.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <button onClick={() => handleDemoLogin(DEMO_USERS[0])} className="brutal-btn-primary px-8 py-4 text-base">
              → Enter Dashboard
            </button>
            <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="brutal-btn-ghost px-8 py-4 text-base">
              How It Works
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-12 border-t border-white/10">
            {[
              { val: "$2.4M+", label: "Platform Volume" },
              { val: "187", label: "Active Freelancers" },
              { val: "2.5%", label: "Flat Take Rate" },
              { val: "12min", label: "Avg. Payout Time" },
            ].map((s, i) => (
              <div key={s.label}>
                <div className={i === 1 ? "stat-value text-pink-500" : "stat-value"}>{s.val}</div>
                <div className={i === 1 ? "stat-label mt-1 text-pink-400/60" : "stat-label mt-1"}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
<section id="features" className="px-6 py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-zinc-500 font-mono">Here&apos;s How It Works:</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mt-2">
              Built for <span className="text-pink-500">serious</span> freelancers.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={i === 0 ? "brutal-card p-8 border-pink-500/30 hover:bg-zinc-900 transition-colors group" : "brutal-card p-8 hover:bg-zinc-900 transition-colors group"}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-3">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-light">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="px-6 py-24 border-t border-white/10 bg-zinc-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
            <span className="text-pink-500">STOP</span> <span className="text-pink-500">CHASING</span><br />PAYMENTS.
          </div>
          <p className="text-zinc-400 mt-6 max-w-xl mx-auto font-light">
            Every invoice is a smart contract. Every payout is instant. Every
            dispute is transparent. This is how freelancing should always have worked.
          </p>
          <button onClick={() => handleDemoLogin(DEMO_USERS[0])} className="brutal-btn-primary px-10 py-4 text-base mt-10">
            → Get Paid — Free Demo
          </button>
        </div>
      </section>
      <footer className="px-6 py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm font-mono text-zinc-600">
            <span className="text-pink-500">f</span>uckyoupayme.online
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-700 font-mono">
            <a href="/terms" className="hover:text-zinc-500 transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-zinc-500 transition-colors">Privacy</a>
            <span>© 2026 FuckYouPayMe</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
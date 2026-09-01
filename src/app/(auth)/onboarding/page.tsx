"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type OnboardingStep = 1 | 2 | 3 | 4 | 5;
const STEPS = [1, 2, 3, 4, 5] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(session?.user?.name || "");
  const [businessName, setBusinessName] = useState("");
  const [country, setCountry] = useState("US");
  const [currency, setCurrency] = useState("USD");

  const [maxLevel, setMaxLevel] = useState("fuck_you");
  const [reminderInterval, setReminderInterval] = useState(3);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "crypto" | "later">("later");
  const [cryptoWallet, setCryptoWallet] = useState("");

const handleNext = async () => {
    setLoading(true);
    try {
      if (step === 2) {
        await fetch("/api/auth/onboarding", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: 2, name, businessName: businessName || null, country, currency }),
        });
      } else if (step === 3) {
        await fetch("/api/auth/onboarding", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: 3, cryptoWalletAddress: paymentMethod === "crypto" ? cryptoWallet : null }),
        });
      } else if (step === 4) {
        await fetch("/api/auth/onboarding", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: 4, escalationMaxLevel: maxLevel, escalationInterval: reminderInterval }),
        });
      } else if (step === 5) {
        await fetch("/api/auth/onboarding", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: 5, onboarded: true }),
        });
        await update();
        router.push("/dashboard");
        return;
      }
    } catch {}
    setLoading(false);
    if (step < 5) setStep((step + 1) as OnboardingStep);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s) => (
            <div key={s} className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className={`h-full transition-all ${s <= step ? "bg-pink-500" : "bg-transparent"}`} />
            </div>
          ))}
        </div>
        <div className="text-xs font-mono text-zinc-500 mb-2">Step {step} of 5</div>

        {step === 1 && (
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">You&apos;re in.</h1>
            <p className="text-zinc-400 mt-3 leading-relaxed font-light">
              Let&apos;s get you set up to start invoicing. This takes about 2 minutes.
            </p>
            <p className="text-zinc-600 text-sm mt-4 font-mono">You can change everything later.</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-6">Your Profile</h1>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Your Name</label>
                <input className="brutal-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Business Name (optional)</label>
                <input className="brutal-input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Acme Design Studio" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Country</label>
                  <select className="brutal-input" value={country} onChange={(e) => setCountry(e.target.value)}>
                    <option value="US">🇺🇸 United States</option>
                    <option value="GB">🇬🇧 United Kingdom</option>
                    <option value="DE">🇩🇪 Germany</option>
                    <option value="CA">🇨🇦 Canada</option>
                    <option value="AU">🇦🇺 Australia</option>
                    <option value="NZ">🇳🇿 New Zealand</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Currency</label>
                  <select className="brutal-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="USD">USD $</option><option value="EUR">EUR €</option><option value="GBP">GBP £</option>
                    <option value="AUD">AUD $</option><option value="CAD">CAD $</option><option value="NZD">NZD $</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
{step === 3 && (
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-6">Get Paid</h1>
            <p className="text-zinc-400 text-sm mb-6 font-light">How do you want to receive payments?</p>
            <div className="space-y-3">
              {[
                { id: "stripe", label: "💳 Bank Account (Stripe)", sub: "Direct deposit. 2-5 business days." },
                { id: "crypto", label: "🔗 Crypto Wallet", sub: "USDT, USDC, BTC, ETH. Non-custodial." },
                { id: "later", label: "⏰ I'll Do This Later", sub: "Set up payouts when you're ready." },
              ].map((opt) => (
                <button key={opt.id} onClick={() => setPaymentMethod(opt.id as typeof paymentMethod)}
                  className={`w-full text-left p-4 border transition-all ${paymentMethod === opt.id ? "border-pink-500 bg-pink-500/10" : "border-white/10 hover:bg-zinc-900"}`}>
                  <div className="font-bold text-white">{opt.label}</div>
                  <div className="text-xs text-zinc-500 mt-1 font-mono">{opt.sub}</div>
                </button>
              ))}
              {paymentMethod === "crypto" && (
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Wallet Address</label>
                  <input className="brutal-input" value={cryptoWallet} onChange={(e) => setCryptoWallet(e.target.value)} placeholder="0x... or bc1..." />
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-6">How Aggressive?</h1>
            <p className="text-zinc-400 text-sm mb-6 font-light">Pick your default dunning style.</p>
            <div className="space-y-3 mb-6">
              {[
                { value: "polite", label: "😊 Polite", desc: "Professional reminders. No pressure." },
                { value: "firm", label: "😤 Firm", desc: "Direct language. Clear consequences." },
                { value: "fuck_you", label: "🖕 Fuck You (Recommended)", desc: "Escalates from pro to confrontational." },
                { value: "nuclear", label: "☢️ Nuclear", desc: "Small claims threats. Credit reporting." },
              ].map((opt) => (
                <button key={opt.value} onClick={() => setMaxLevel(opt.value)}
                  className={`w-full text-left p-4 border transition-all ${maxLevel === opt.value ? "border-pink-500 bg-pink-500/10" : "border-white/10 hover:bg-zinc-900"}`}>
                  <div className="font-bold text-white">{opt.label}</div>
                  <div className="text-xs text-zinc-500 mt-1 font-mono">{opt.desc}</div>
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Reminder Interval (days)</label>
              <div className="flex items-center gap-3">
                <input type="number" min={1} max={30} className="brutal-input w-24" value={reminderInterval}
                  onChange={(e) => setReminderInterval(parseInt(e.target.value) || 3)} />
                <span className="text-xs text-zinc-500 font-mono">days between reminders</span>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">You&apos;re Ready.</h1>
            <p className="text-zinc-400 mt-3 leading-relaxed font-light">Time to send your first invoice.</p>
            <div className="mt-6 bg-zinc-900 border border-white/10 p-4">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Your defaults</div>
              <div className="mt-2 space-y-1 text-sm text-zinc-300">
                <div>Currency: {currency}</div>
                <div>Country: {country}</div>
                <div>Dunning level: {maxLevel.replace("_", " ")}</div>
                <div>Reminder interval: Every {reminderInterval} days</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-10">
          <button onClick={() => step > 1 && setStep((step - 1) as OnboardingStep)}
            className={`brutal-btn-ghost px-6 py-3 text-sm ${step === 1 ? "opacity-0 pointer-events-none" : ""}`}>
            ← Back
          </button>
          <button onClick={handleNext} disabled={loading}
            className="brutal-btn-primary px-8 py-3 text-sm disabled:opacity-50">
            {loading ? "Saving…" : step === 5 ? "→ Go to Dashboard" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}

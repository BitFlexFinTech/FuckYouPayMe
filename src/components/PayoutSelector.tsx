"use client";

import { useAppState } from "@/context/AppContext";
import { PayoutMethod } from "@/lib/types";

const PAYOUT_OPTIONS: { value: PayoutMethod; label: string; flag: string; desc: string }[] = [
  { value: "wise", label: "Wise", flag: "🌍", desc: "Multi-currency · 1-2 days" },
  { value: "sepa", label: "SEPA", flag: "🇪🇺", desc: "EU bank transfer · Instant" },
  { value: "mobile_money", label: "Mobile Money", flag: "📱", desc: "M-Pesa, MTN, Airtel · Instant" },
  { value: "paypal", label: "PayPal", flag: "💳", desc: "Global · 1-3 days" },
  { value: "crypto", label: "Crypto (USDC)", flag: "🔗", desc: "On-chain · 10min" },
];

export default function PayoutSelector() {
  const { state, dispatch } = useAppState();

  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-3">Payout Method</div>
      <div className="space-y-1">
        {PAYOUT_OPTIONS.map((opt) => {
          const isActive = state.payoutMethod === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => dispatch({ type: "SET_PAYOUT_METHOD", payload: opt.value })}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm border transition-all ${
                isActive
                  ? "border-pink-500 bg-pink-500/10 text-white"
                  : "border-white/10 text-zinc-400 hover:bg-white/5"
              }`}
            >
              <span className="text-lg">{opt.flag}</span>
              <div className="flex-1 text-left">
                <div className="font-semibold">{opt.label}</div>
                <div className="text-[10px] font-mono text-zinc-500">{opt.desc}</div>
              </div>
              {isActive && <span className="text-pink-400 text-xs font-bold">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
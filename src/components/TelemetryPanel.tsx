"use client";

import { useAppState } from "@/context/AppContext";

export default function TelemetryPanel() {
  const { state } = useAppState();

  const metrics = [
    { label: "Total Platform Volume", value: `$${state.telemetry.totalPlatformVolume.toLocaleString()}`, change: "+12.4%" },
    { label: "Total Invoices", value: String(state.telemetry.totalInvoiceCount), change: "+3 this week" },
    { label: "Active Users", value: String(state.telemetry.activeUsers), change: "+8.2% MoM" },
    { label: "Pending Payouts", value: String(state.telemetry.pendingPayouts), change: "Awaiting release" },
    { label: "Platform Fee (avg)", value: `${state.adminFeePercent}%`, change: "Configurable" },
    { label: "Invoices at Risk", value: "0", change: "All current" },
  ];

  return (
    <div className="brutal-card p-6">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1">
        Platform Telemetry
      </div>
      <div className="text-lg font-bold uppercase tracking-tight mb-6 text-white">
        Volume &amp; Metrics
      </div>
      <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div>
              <div className="text-sm text-zinc-300">{m.label}</div>
              <div className="text-[10px] text-zinc-600 font-mono">{m.change}</div>
            </div>
            <div className="text-lg font-black tracking-tighter text-white font-mono">
              {m.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
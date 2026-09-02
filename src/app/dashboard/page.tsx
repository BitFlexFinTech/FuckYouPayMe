"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    fetch("/api/dashboard/stats", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("API returned " + r.status);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) { setStats(data); setLoading(false); }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load");
          setLoading(false);
        }
      })
      .finally(() => clearTimeout(timeout));

    return () => { cancelled = true; controller.abort(); };
  }, []);

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "border-zinc-500/30 text-zinc-400 bg-zinc-500/10",
      SENT: "border-blue-500/30 text-blue-400 bg-blue-500/10",
      PAID: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
      OVERDUE: "border-orange-500/30 text-orange-400 bg-orange-500/10",
      DUNNING_ACTIVE: "border-pink-500/30 text-pink-400 bg-pink-500/10",
    };
    return colors[status] || colors.DRAFT;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-pink-500 text-4xl mb-4 animate-pulse">&#x25CF;</div>
          <div className="text-zinc-500 font-mono text-xs">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    // Show a basic dashboard even without API data
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">{session?.user?.name || "Dashboard"}</h1>
            <p className="text-sm text-zinc-500 font-mono mt-1">Freelancer Dashboard</p>
          </div>
          <button onClick={() => router.push("/invoices")} className="brutal-btn-primary px-6 py-3 text-sm">
            + New Invoice
          </button>
        </div>
        <div className="brutal-card p-8 text-center">
          <p className="text-zinc-500 font-mono text-xs">Welcome to FuckYouPayMe. Create your first invoice to get started.</p>
        </div>
      </div>
    );
  }

return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">{stats.user?.name || session?.user?.name || "Dashboard"}</h1>
          <p className="text-sm text-zinc-500 font-mono mt-1">Freelancer Dashboard</p>
        </div>
        <button onClick={() => router.push("/invoices")} className="brutal-btn-primary px-6 py-3 text-sm">
          + New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="brutal-card p-6">
          <div className="stat-label">Paid</div>
          <div className="stat-value text-emerald-400">${((stats.totalPaid || 0) / 100).toLocaleString()}</div>
          <div className="text-xs text-zinc-600 mt-1 font-mono">{stats.invoiceCount || 0} invoices</div>
        </div>
        <div className="brutal-card p-6">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value text-pink-400">${((stats.totalOutstanding || 0) / 100).toLocaleString()}</div>
          <div className="text-xs text-zinc-600 mt-1 font-mono">Awaiting payment</div>
        </div>
        <div className="brutal-card p-6">
          <div className="stat-label">Active Dunning</div>
          <div className="stat-value text-white">{stats.activeDunning || 0}</div>
          <div className="text-xs text-zinc-600 mt-1 font-mono">In escalation</div>
        </div>
        <div className="brutal-card p-6">
          <div className="stat-label">Avg. Payment</div>
          <div className="stat-value text-white">{stats.avgPaymentDays || 0}d</div>
          <div className="text-xs text-zinc-600 mt-1 font-mono">{stats.totalClients || 0} clients</div>
        </div>
      </div>

      <div className="brutal-card">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono">Recent Invoices</span>
          <button onClick={() => router.push("/invoices")} className="text-[10px] font-mono text-pink-400">View All &rarr;</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
                <th className="text-left px-6 py-3 font-normal">Client</th>
                <th className="text-left px-6 py-3 font-normal">Amount</th>
                <th className="text-left px-6 py-3 font-normal hidden sm:table-cell">Status</th>
                <th className="text-left px-6 py-3 font-normal hidden md:table-cell">Due</th>
              </tr>
            </thead>
            <tbody>
              {(stats.recentInvoices || []).map((inv: any) => (
                <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                  onClick={() => router.push("/invoices/" + inv.id)}>
                  <td className="px-6 py-4 font-medium text-white">{inv.clientName}</td>
                  <td className="px-6 py-4 font-mono">${((inv.total || 0) / 100).toLocaleString()}</td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className={"inline-block px-2 py-0.5 text-[10px] font-mono uppercase border " + statusColor(inv.status)}>
                      {(inv.status || "").replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500 hidden md:table-cell">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
              {(!stats.recentInvoices || stats.recentInvoices.length === 0) && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-zinc-500 font-mono text-xs">No invoices yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
  // ... rest of the dashboard with real data
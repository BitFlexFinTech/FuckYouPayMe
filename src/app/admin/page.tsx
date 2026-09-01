"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zinc-500 font-mono text-xs">Loading...</div>;
  if (!stats) return <div className="text-zinc-500 font-mono text-xs">No data</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Platform Admin</h1>
        <p className="text-sm text-zinc-500 font-mono mt-1">Control Center</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="brutal-card p-5">
          <div className="stat-label">GMV</div>
          <div className="stat-value text-pink-400">${(stats.totalGmv / 100).toLocaleString()}</div>
        </div>
        <div className="brutal-card p-5">
          <div className="stat-label">Fees</div>
          <div className="stat-value text-pink-400">${(stats.totalFees / 100).toLocaleString()}</div>
        </div>
        <div className="brutal-card p-5">
          <div className="stat-label">Freelancers</div>
          <div className="stat-value">{stats.activeFreelancers}</div>
        </div>
        <div className="brutal-card p-5">
          <div className="stat-label">Invoices</div>
          <div className="stat-value">{stats.totalInvoices}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="brutal-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-4">Payment Breakdown</div>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-zinc-300">Stripe</span><span className="font-mono text-white">{stats.stripeCount}</span></div>
              <div className="flex justify-between"><span className="text-sm text-zinc-300">Crypto</span><span className="font-mono text-white">{stats.cryptoCount}</span></div>
              <div className="flex justify-between pt-2 border-t border-white/10"><span className="text-sm text-zinc-300">Paid</span><span className="font-mono text-emerald-400">{stats.paidInvoices}/{stats.totalInvoices}</span></div>
            </div>
          </div>
          <div className="brutal-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-4">Dunning</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-zinc-400">Emails Sent</span><span className="font-mono text-white">{stats.dunningSent}</span></div>
              <div className="flex justify-between text-sm pt-2 border-t border-white/10"><span className="text-zinc-400">Open Disputes</span><span className="font-mono text-red-400">{stats.openDisputes}</span></div>
            </div>
          </div>
        </div>
        <div>
          <div className="brutal-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-4">Recent Freelancers</div>
            <div className="space-y-3">
              {stats.recentUsers?.map((u: any) => (
                <div key={u.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold text-xs">{(u.name || "?").charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{u.name || "Unnamed"}</div>
                    <div className="text-[10px] font-mono text-zinc-500 truncate">{u.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="brutal-card p-6 mt-6">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-4">Quick Actions</div>
            <div className="space-y-2">
              <a href="/admin/users" className="block w-full py-3 border border-white/10 text-center text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/5 uppercase tracking-wider">Manage Users</a>
              <a href="/admin/transactions" className="block w-full py-3 border border-white/10 text-center text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/5 uppercase tracking-wider">Transactions</a>
              <a href="/admin/dunning-log" className="block w-full py-3 border border-white/10 text-center text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/5 uppercase tracking-wider">Dunning Log</a>
              <a href="/admin/disputes" className="block w-full py-3 border border-white/10 text-center text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/5 uppercase tracking-wider">Disputes</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
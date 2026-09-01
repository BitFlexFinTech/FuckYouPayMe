"use client";

import { useState, useEffect } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users?" + (statusFilter ? "status=" + statusFilter : "")).then((r) => r.json()),
      fetch("/api/admin/stats").then((r) => r.json()),
    ]).then(([usersData, statsData]) => {
      setUsers(usersData.users || []);
      setStats(statsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter">User Management</h1>
        <div className="text-xs text-zinc-500 font-mono">{stats?.activeFreelancers || "..."} total freelancers</div>
      </div>

      <div className="flex gap-2 mb-6">
        {["", "onboarded", "pending"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={"px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-all " + (statusFilter === s ? "border-pink-500 bg-pink-500/10 text-pink-400" : "border-white/10 text-zinc-500 hover:text-white")}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="brutal-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
                <th className="text-left px-6 py-3 font-normal">Name</th>
                <th className="text-left px-6 py-3 font-normal">Email</th>
                <th className="text-left px-6 py-3 font-normal">Status</th>
                <th className="text-left px-6 py-3 font-normal hidden md:table-cell">Invoices</th>
                <th className="text-left px-6 py-3 font-normal hidden md:table-cell">Stripe</th>
                <th className="text-left px-6 py-3 font-normal hidden lg:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-mono text-xs">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-mono text-xs">No users found</td></tr>
              ) : users.map((u: any) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 font-medium text-white">{u.name || "—"}</td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-400">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={"inline-block px-2 py-0.5 text-[10px] font-mono uppercase border " + (u.onboarded ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-yellow-500/30 text-yellow-400 bg-yellow-500/10")}>
                      {u.onboarded ? "Active" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500 hidden md:table-cell">{u._count?.invoices || 0}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={"text-[10px] font-mono " + (u.stripeAccountId ? "text-emerald-400" : "text-zinc-600")}>
                      {u.stripeAccountId ? "Connected" : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-600 hidden lg:table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

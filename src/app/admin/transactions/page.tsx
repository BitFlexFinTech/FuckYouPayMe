"use client";

import { useState, useEffect } from "react";

export default function AdminTransactionsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState("");

  useEffect(() => {
    const params = methodFilter ? "?method=" + methodFilter : "";
    fetch("/api/admin/transactions" + params)
      .then((r) => r.json())
      .then((data) => { setPayments(data.payments || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [methodFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Transaction Log</h1>
        <div className="text-xs text-zinc-500 font-mono">{payments.length} transactions</div>
      </div>

      <div className="flex gap-2 mb-6">
        {["", "stripe", "crypto"].map((s) => (
          <button key={s} onClick={() => setMethodFilter(s)}
            className={"px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-all " + (methodFilter === s ? "border-pink-500 bg-pink-500/10 text-pink-400" : "border-white/10 text-zinc-500 hover:text-white")}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="brutal-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
                <th className="text-left px-6 py-3 font-normal">Date</th>
                <th className="text-left px-6 py-3 font-normal">Amount</th>
                <th className="text-left px-6 py-3 font-normal">Method</th>
                <th className="text-left px-6 py-3 font-normal">Status</th>
                <th className="text-left px-6 py-3 font-normal hidden md:table-cell">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-mono text-xs">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-mono text-xs">No transactions yet</td></tr>
              ) : payments.map((p: any) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-mono">${(p.amount / 100).toFixed(2)}</td>
                  <td className="px-6 py-4"><span className="text-[10px] font-mono uppercase text-zinc-300">{p.method?.replace(/_/g, " ")}</span></td>
                  <td className="px-6 py-4">
                    <span className={"inline-block px-2 py-0.5 text-[10px] font-mono uppercase border " + (p.status === "PAID" ? "border-emerald-500/30 text-emerald-400" : "border-zinc-500/30 text-zinc-400")}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500 hidden md:table-cell">{p.invoice?.invoiceNumber || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
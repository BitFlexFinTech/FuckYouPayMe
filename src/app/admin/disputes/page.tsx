"use client";

import { useState, useEffect } from "react";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const params = statusFilter ? "?status=" + statusFilter : "";
    fetch("/api/admin/disputes" + params)
      .then((r) => r.json())
      .then((data) => { setDisputes(data.disputes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [statusFilter]);

  const handleResolve = async (disputeId: string, action: string) => {
    await fetch("/api/admin/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disputeId, action, resolution: "Resolved by admin" }),
    });
    setDisputes(disputes.filter((d) => d.id !== disputeId));
  };

  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">Dispute Queue</h1>

      <div className="flex gap-2 mb-6">
        {["", "OPEN", "RESOLVED_FREELANCER", "RESOLVED_CLIENT", "VOIDED"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={"px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-all " + (statusFilter === s ? "border-pink-500 bg-pink-500/10 text-pink-400" : "border-white/10 text-zinc-500 hover:text-white")}>
            {s.replace(/_/g, " ") || "All"}
          </button>
        ))}
      </div>

      <div className="brutal-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
                <th className="text-left px-6 py-3 font-normal">Client</th>
                <th className="text-left px-6 py-3 font-normal">Invoice</th>
                <th className="text-left px-6 py-3 font-normal">Reason</th>
                <th className="text-left px-6 py-3 font-normal">Status</th>
                <th className="text-left px-6 py-3 font-normal hidden md:table-cell">Filed</th>
                <th className="text-right px-6 py-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-mono text-xs">Loading...</td></tr>
              ) : disputes.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-mono text-xs">No disputes</td></tr>
              ) : disputes.map((d: any) => (
                <tr key={d.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 text-white">{d.clientName}</td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500">{d.invoice?.invoiceNumber || "—"}</td>
                  <td className="px-6 py-4 text-zinc-400 max-w-[200px] truncate">{d.reason}</td>
                  <td className="px-6 py-4">
                    <span className={"inline-block px-2 py-0.5 text-[10px] font-mono uppercase border " + (d.status === "OPEN" ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/10" : "border-emerald-500/30 text-emerald-400")}>{d.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500 hidden md:table-cell">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    {d.status === "OPEN" && (
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => handleResolve(d.id, "freelancer_wins")} className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-mono uppercase hover:bg-emerald-500">Win</button>
                        <button onClick={() => handleResolve(d.id, "client_wins")} className="px-2 py-1 bg-red-600 text-white text-[10px] fon-mono uppercase hover:bg-red-500">Client</button>
                        <button onClick={() => handleResolve(d.id, "void")} className="px-2 py-1 bg-zinc-600 text-white text-[10px] font-mono uppercase hover:bg-zinc-500">Void</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
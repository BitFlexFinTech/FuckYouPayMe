"use client";

import { useState, useEffect } from "react";

export default function AdminDunningLogPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState("");

  useEffect(() => {
    const params = levelFilter ? "?level=" + levelFilter : "";
    fetch("/api/admin/dunning-log" + params)
      .then((r) => r.json())
      .then((data) => { setEvents(data.events || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [levelFilter]);

  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">Dunning Log</h1>

      <div className="flex gap-2 mb-6">
        {["", "polite", "firm", "fuck_you", "nuclear"].map((s) => (
          <button key={s} onClick={() => setLevelFilter(s)}
            className={"px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-all " + (levelFilter === s ? "border-pink-500 bg-pink-500/10 text-pink-400" : "border-white/10 text-zinc-500 hover:text-white")}>
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
                <th className="text-left px-6 py-3 font-normal">Subject</th>
                <th className="text-left px-6 py-3 font-normal">Level</th>
                <th className="text-left px-6 py-3 font-normal">Stage</th>
                <th className="text-left px-6 py-3 font-normal hidden md:table-cell">Recipient</th>
                <th className="text-left px-6 py-3 font-normal hidden md:table-cell">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-mono text-xs">Loading...</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-mono text-xs">No dunning events yet</td></tr>
              ) : events.map((e: any) => (
                <tr key={e.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-400">{new Date(e.sentAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-white max-w-[200px] truncate">{e.subject}</td>
                  <td className="px-6 py-4"><span className="text-[10px] font-mono uppercase text-zinc-300">{e.level}</span></td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500">Stage {e.stage}</td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500 hidden md:table-cell">{e.recipient}</td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500 hidden md:table-cell">{e.invoice?.invoiceNumber || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dunningResult, setDunningResult] = useState("");

  useEffect(() => {
    fetch(`/api/invoices/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setInvoice(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleSend = async () => {
    const res = await fetch(`/api/invoices/${params.id}/send`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setInvoice({ ...invoice, status: "SENT", nextDunningDate: data.nextDunningDate });
    }
  };

  const handleFuckYou = async () => {
    const res = await fetch("/api/dunning/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId: params.id }),
    });
    const data = await res.json();
    if (data.sent) {
      setDunningResult(`Stage ${data.stage} email sent.`);
      setInvoice({ ...invoice, dunningStage: data.stage + 1, status: "DUNNING_ACTIVE" });
    } else {
      setDunningResult(data.reason || "Could not send");
    }
  };

  const handleVoid = async () => {
    await fetch(`/api/invoices/${params.id}`, { method: "DELETE" });
    router.push("/invoices");
  };

  const resolveDispute = async (action: string) => {
    const dispute = invoice.disputes?.[0];
    if (!dispute) return;
    await fetch(`/api/disputes/${dispute.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, resolution: "Resolved by freelancer" }),
    });
    // Reload invoice data
    const res = await fetch(`/api/invoices/${params.id}`);
    const data = await res.json();
    setInvoice(data);
  };

  const daysOverdue = invoice
    ? Math.max(0, Math.ceil((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (loading) return <div className="p-8 text-zinc-500 font-mono text-xs">Loading...</div>;
  if (!invoice) return <div className="p-8 text-zinc-500 font-mono text-xs">Invoice not found</div>;

  return (
    <div>
      <button onClick={() => router.push("/invoices")} className="text-xs font-mono text-zinc-500 hover:text-white mb-4">← Back to Invoices</button>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">{invoice.clientName}</h1>
          <p className="text-sm text-zinc-500 font-mono mt-1">{invoice.invoiceNumber}</p>
        </div>
        <div className="flex gap-2">
          {invoice.status === "DRAFT" && (
            <button onClick={handleSend} className="brutal-btn-primary px-6 py-3 text-sm">→ Send Invoice</button>
          )}
          {["SENT", "OVERDUE", "DUNNING_ACTIVE"].includes(invoice.status) && (
            <button onClick={handleFuckYou} className="brutal-btn-primary px-6 py-3 text-sm bg-red-600 hover:bg-red-500">🖕 Send Next Email</button>
          )}
          <a href={`/api/invoices/${params.id}/pdf`} target="_blank" className="brutal-btn-ghost px-4 py-3 text-sm">Download PDF</a>
          <button onClick={handleVoid} className="brutal-btn-ghost px-4 py-3 text-sm text-red-400">Void</button>
        </div>
      </div>

      {dunningResult && (
        <div className="bg-pink-500/10 border border-pink-500/30 text-pink-300 px-4 py-3 text-sm mb-6 font-mono">{dunningResult}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="brutal-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-4">Invoice Details</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-zinc-500">Client</span><p className="text-white font-medium">{invoice.clientName}</p></div>
              <div><span className="text-zinc-500">Email</span><p className="text-white font-mono text-xs">{invoice.clientEmail}</p></div>
              <div><span className="text-zinc-500">Due Date</span><p className="text-white font-mono">{new Date(invoice.dueDate).toLocaleDateString()}</p></div>
              <div><span className="text-zinc-500">Status</span>
                <span className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase border ${
                  invoice.status === "PAID" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                  : invoice.status === "DUNNING_ACTIVE" ? "border-pink-500/30 text-pink-400 bg-pink-500/10"
                  : invoice.status === "OVERDUE" ? "border-orange-500/30 text-orange-400 bg-orange-500/10"
                  : "border-zinc-500/30 text-zinc-400 bg-zinc-500/10"
                }`}>{invoice.status.replace(/_/g, " ")}</span>
              </div>
              {daysOverdue > 0 && <div><span className="text-zinc-500">Days Overdue</span><p className="text-red-400 font-bold">{daysOverdue} days</p></div>}
              <div><span className="text-zinc-500">Currency</span><p className="text-white font-mono">{invoice.currency}</p></div>
            </div>
          </div>

          <div className="brutal-card">
            <div className="px-6 py-4 border-b border-white/10">
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono">Line Items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
                    <th className="text-left px-6 py-3 font-normal">Description</th>
                    <th className="text-right px-6 py-3 font-normal">Qty</th>
                    <th className="text-right px-6 py-3 font-normal">Rate</th>
                    <th className="text-right px-6 py-3 font-normal">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item: any) => (
                    <tr key={item.id} className="border-b border-white/5">
                      <td className="px-6 py-4 text-white">{item.description}</td>
                      <td className="px-6 py-4 text-right font-mono">{item.quantity}</td>
                      <td className="px-6 py-4 text-right font-mono">${(item.rate / 100).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-mono">${(item.amount / 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10 font-mono text-sm">
                    <td colSpan={3} className="px-6 py-3 text-right text-zinc-400">Subtotal</td>
                    <td className="px-6 py-3 text-right font-mono text-white">${(invoice.subtotal / 100).toFixed(2)}</td>
                  </tr>
                  {invoice.taxAmount > 0 && (
                    <tr className="font-mono text-sm">
                      <td colSpan={3} className="px-6 py-1 text-right text-zinc-400">Tax ({invoice.taxPercent}%)</td>
                      <td className="px-6 py-1 text-right font-mono text-white">${(invoice.taxAmount / 100).toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="font-mono text-sm font-bold">
                    <td colSpan={3} className="px-6 py-3 text-right text-white border-t border-white/10">Total</td>
                    <td className="px-6 py-3 text-right font-mono text-pink-400 border-t border-white/10">${(invoice.total / 100).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="brutal-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-4">Fee Breakdown</div>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between"><span className="text-zinc-400">Platform Fee</span><span className="text-pink-400">${(invoice.platformFeeAmount / 100).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">You Receive</span><span className="text-emerald-400">${(invoice.freelancerReceives / 100).toFixed(2)}</span></div>
              {invoice.lateFeeTotal > 0 && (
                <div className="flex justify-between"><span className="text-zinc-400">Late Fees</span><span className="text-orange-400">${(invoice.lateFeeTotal / 100).toFixed(2)}</span></div>
              )}
            </div>
          </div>

          <div className="brutal-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-4">Dunning Status</div>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between"><span className="text-zinc-400">Level</span><span className="text-white capitalize">{invoice.dunningLevel?.replace("_", " ") || "fuck you"}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Stage</span><span className="text-white">{invoice.dunningStage}/{invoice.maxDunningStage || 4}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Completed</span><span className={invoice.dunningCompleted ? "text-emerald-400" : "text-zinc-400"}>{invoice.dunningCompleted ? "Yes" : "No"}</span></div>
              {invoice.nextDunningDate && (
                <div className="flex justify-between"><span className="text-zinc-400">Next</span><span className="text-white text-xs">{new Date(invoice.nextDunningDate).toLocaleDateString()}</span></div>
              )}
            </div>
          </div>

          {invoice.disputes?.length > 0 && (
            <div className="brutal-card p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-4">
                Dispute {invoice.disputes[0].status === "OPEN" ? <span className="text-yellow-400">(Open)</span> : <span className="text-emerald-400">(Resolved)</span>}
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="text-zinc-400">Reason</span><p className="text-white mt-0.5">{invoice.disputes[0].reason}</p></div>
                <div><span className="text-zinc-400">Filed</span><p className="text-white font-mono text-xs">{new Date(invoice.disputes[0].createdAt).toLocaleDateString()}</p></div>
                {invoice.disputes[0].resolution && (
                  <div><span className="text-zinc-400">Resolution</span><p className="text-white mt-0.5">{invoice.disputes[0].resolution}</p></div>
                )}
                {invoice.disputes[0].status === "OPEN" && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => resolveDispute("freelancer_wins")}
                      className="flex-1 py-2 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500">
                      I Win
                    </button>
                    <button onClick={() => resolveDispute("void")}
                      className="flex-1 py-2 border border-white/10 text-zinc-400 text-xs font-bold uppercase tracking-wider hover:bg-white/5">
                      Void Invoice
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {invoice.dunningEvents?.length > 0 && (
            <div className="brutal-card p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-4">Email History</div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {invoice.dunningEvents.map((evt: any) => (
                  <div key={evt.id} className="border-l-2 border-pink-500/30 pl-3">
                    <div className="text-[10px] font-mono text-zinc-500">{new Date(evt.sentAt).toLocaleString()}</div>
                    <div className="text-xs text-zinc-300 mt-1">{evt.subject}</div>
                    <div className="text-[10px] text-zinc-600 font-mono mt-0.5 capitalize">{evt.level} · Stage {evt.stage}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {invoice.notes && (
            <div className="brutal-card p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-2">Notes</div>
              <p className="text-sm text-zinc-400 font-light">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
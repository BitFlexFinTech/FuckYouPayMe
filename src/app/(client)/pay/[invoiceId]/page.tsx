"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function ClientPayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payMethod, setPayMethod] = useState<"card" | "crypto">("card");
  const [processing, setProcessing] = useState(false);
  const [cryptoInfo, setCryptoInfo] = useState<any>(null);
  const [cryptoCurrency, setCryptoCurrency] = useState("USDT");
  const [error, setError] = useState("");
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);
  const [disputing, setDisputing] = useState(false);

  const successParam = searchParams.get("success");
  const paidParam = searchParams.get("paid");

  useEffect(() => {
    fetch("/api/invoices/" + params.invoiceId)
      .then((r) => r.json())
      .then((data) => { setInvoice(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.invoiceId]);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-xs">Loading invoice...</div>;
  }
  if (!invoice) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-xs">Invoice not found</div>;
  }
  if (["PAID", "SETTLED"].includes(invoice.status) || successParam || paidParam) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">&#9989;</div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-emerald-400">Paid!</h1>
          <p className="text-zinc-400 mt-4 font-light">Invoice {invoice.invoiceNumber} has been paid. No more emails.</p>
        </div>
      </div>
    );
const daysOverdue = Math.max(0, Math.ceil((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)));

  const handleCardPayment = async () => {
    setProcessing(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: params.invoiceId }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setError(data.error || "Payment failed"); setProcessing(false); }
    } catch { setError("Failed to start payment"); setProcessing(false); }
  };

  const handleCryptoPayment = async () => {
    setProcessing(true);
    setError("");
    try {
      const res = await fetch("/api/payments/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: params.invoiceId, payCurrency: cryptoCurrency }),
      });
      const data = await res.json();
      if (data.address) { setCryptoInfo(data); setProcessing(false); }
      else { setError(data.error || "Crypto init failed"); setProcessing(false); }
    } catch { setError("Crypto init failed"); setProcessing(false); }
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) return;
    setDisputing(true);
    try {
      const res = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: params.invoiceId, reason: disputeReason, clientName: invoice.clientName, clientEmail: invoice.clientEmail }),
      });
      if (res.ok) { setDisputeSubmitted(true); }
      else { setError("Failed to submit dispute."); }
    } catch (e) { setError("Failed to submit dispute."); }
    setDisputing(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="px-6 py-4 border-b border-white/10">
        <div className="max-w-2xl mx-auto">
          <span className="text-sm font-mono text-zinc-600">
            <span className="text-pink-500">f</span>uckyoupayme.online
          </span>
        </div>
      </div>
      <div className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {daysOverdue > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 px-4 py-3 mb-6">
              <span className="text-red-400 text-sm font-mono">Overdue {daysOverdue} days.</span>
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 px-4 py-3 mb-6">
              <span className="text-red-400 text-sm font-mono">{error}</span>
            </div>
          )}
          {disputeSubmitted && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 mb-6">
              <span className="text-yellow-400 text-sm font-mono">Dispute submitted. Dunning emails have been paused.</span>
            </div>
          )}
          <div className="brutal-card p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter">{invoice.clientName}</h1>
                <p className="text-sm text-zinc-500 font-mono mt-1">Invoice {invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black tracking-tighter text-pink-400">${(invoice.total / 100).toFixed(2)}</div>
                <div className="text-xs text-zinc-500 font-mono mt-1">{invoice.currency}</div>
              </div>
            </div>
          </div>
{!cryptoInfo ? (
            <div className="brutal-card p-6">
              <h2 className="text-sm font-bold uppercase tracking-tight mb-4">Pay This Invoice</h2>
              <div className="flex gap-2 mb-6">
                <button onClick={() => setPayMethod("card")}
                  className={"flex-1 py-3 text-xs font-bold uppercase tracking-wider border transition-all " + (payMethod === "card" ? "border-pink-500 bg-pink-500/10 text-pink-400" : "border-white/10 text-zinc-500 hover:text-white")}>
                  Card / Bank
                </button>
                <button onClick={() => setPayMethod("crypto")}
                  className={"flex-1 py-3 text-xs font-bold uppercase tracking-wider border transition-all " + (payMethod === "crypto" ? "border-pink-500 bg-pink-500/10 text-pink-400" : "border-white/10 text-zinc-500 hover:text-white")}>
                  Crypto
                </button>
              </div>
              {payMethod === "card" && (
                <div>
                  <p className="text-zinc-400 text-sm mb-4 font-light">Pay securely with card or bank transfer. Powered by Stripe.</p>
                  <button onClick={handleCardPayment} disabled={processing}
                    className="w-full py-4 bg-pink-500 text-white font-bold uppercase tracking-wider text-sm hover:bg-pink-400 transition-colors disabled:opacity-50">
                    {processing ? "Processing..." : "Pay $" + (invoice.total / 100).toFixed(2) + " with Card"}
                  </button>
                </div>
              )}
              {payMethod === "crypto" && (
                <div>
                  <p className="text-zinc-400 text-sm mb-4 font-light">Pay with cryptocurrency. Non-custodial.</p>
                  <div className="flex gap-2 mb-4">
                    {["USDT", "USDC", "BTC", "ETH"].map((c) => (
                      <button key={c} onClick={() => setCryptoCurrency(c)}
                        className={"px-3 py-1.5 text-xs font-mono border transition-all " + (cryptoCurrency === c ? "border-pink-500 bg-pink-500/10 text-pink-400" : "border-white/10 text-zinc-500")}>
                        {c}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleCryptoPayment} disabled={processing}
                    className="w-full py-4 border border-pink-500/30 text-pink-400 font-bold uppercase tracking-wider text-sm hover:bg-pink-500/10 transition-colors disabled:opacity-50">
                    {processing ? "Generating..." : "Pay with " + cryptoCurrency}
                  </button>
                </div>
              )}
              {!disputeSubmitted && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  {!disputeOpen ? (
                    <button onClick={() => setDisputeOpen(true)}
                      className="w-full py-3 border border-yellow-500/30 text-yellow-400 text-xs font-mono uppercase tracking-wider hover:bg-yellow-500/10 transition-colors">
                      &#9888; This Invoice is Incorrect
                    </button>
                  ) : (
                    <div>
                      <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-2 block">Describe the issue</label>
                      <textarea className="brutal-input min-h-[80px] resize-none mb-3"
                        value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Wrong amount, already paid, incorrect client, etc." />
                      <div className="flex gap-2">
                        <button onClick={handleDispute} disabled={disputing || !disputeReason.trim()}
                          className="brutal-btn-primary px-6 py-3 text-xs disabled:opacity-50">
                          {disputing ? "Submitting..." : "Submit Dispute"}
                        </button>
                        <button onClick={() => setDisputeOpen(false)} className="brutal-btn-ghost px-6 py-3 text-xs">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="brutal-card p-6 text-center">
              <h2 className="text-sm font-bold uppercase tracking-tight mb-4">Send Crypto</h2>
              <div className="text-4xl mb-4">&#x1F517;</div>
              <p className="text-zinc-400 text-sm mb-2">Send exact amount to:</p>
              <div className="bg-zinc-900 border border-white/10 px-4 py-3 font-mono text-xs text-zinc-300 break-all select-all mb-4">
                {cryptoInfo.address}
              </div>
              <div className="text-sm text-zinc-400 mb-4">
                Expected: <span className="font-mono text-white">{cryptoInfo.expectedAmount?.toFixed(6)}</span> {cryptoCurrency}
              </div>
              <p className="text-zinc-600 text-xs font-mono">Rate locked for 30 min.</p>
            </div>
          )}
        </div>
      </div>
      <footer className="px-6 py-4 border-t border-white/5 text-[10px] text-zinc-700 font-mono text-center">
        Powered by Stripe + NOWPayments
      </footer>
    </div>
  );
}
  }
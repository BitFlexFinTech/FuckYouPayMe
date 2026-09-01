"use client";

import { useState } from "react";
import { useAppState } from "@/context/AppContext";
import { Notification } from "@/lib/types";

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InvoiceModal({ open, onClose }: InvoiceModalProps) {
  const { state, dispatch } = useAppState();
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");

  if (!open) return null;

  const handleCreate = () => {
    if (!client || !amount) return;

    const numAmount = parseFloat(amount);
    const feeAmount = numAmount * (state.adminFeePercent / 100);

    const newInvoice = {
      id: "",
      client,
      amount: numAmount,
      currency,
      status: "pending" as const,
      createdAt: "",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      vaultHash: "",
      ephemeralAddress: "",
      description,
    };

    dispatch({ type: "CREATE_INVOICE", payload: newInvoice });

    const notif: Notification = {
      id: `notif-${Date.now()}`,
      message: `Invoice created for ${client} — $${numAmount.toLocaleString()} ${currency}. Platform fee: $${feeAmount.toFixed(2)} (${state.adminFeePercent}%).`,
      type: "payment",
      timestamp: new Date().toISOString(),
      read: false,
    };
    dispatch({ type: "ADD_NOTIFICATION", payload: notif });

    setClient("");
    setAmount("");
    setDescription("");
    onClose();
  };

  const feeAmount = parseFloat(amount || "0") * (state.adminFeePercent / 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold uppercase tracking-tight">New Invoice</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-lg">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Client</label>
            <input
              className="brutal-input"
              placeholder="Acme Corp"
              value={client}
              onChange={(e) => setClient(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Amount</label>
              <input
                className="brutal-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="12500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Currency</label>
              <select
                className="brutal-input"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>USDC</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Description</label>
            <textarea
              className="brutal-input min-h-[80px] resize-none"
              placeholder="Q3 Brand Strategy — full campaign deck"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="bg-black/50 border border-white/10 px-4 py-3">
            <div className="flex justify-between text-sm text-zinc-400 font-mono">
              <span>Platform Fee ({state.adminFeePercent}%)</span>
              <span className="text-zinc-300">${feeAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-400 font-mono mt-1">
              <span>You Receive</span>
              <span className="text-pink-400 font-bold">
                ${(parseFloat(amount || "0") - feeAmount).toFixed(2)}
              </span>
            </div>
          </div>
          <button onClick={handleCreate} className="brutal-btn-primary w-full py-4 text-sm">
            → Create Invoice &amp; Generate Vault
          </button>
        </div>
      </div>
    </div>
  );
}
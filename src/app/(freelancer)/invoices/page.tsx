"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  total: number;
  currency: string;
  status: string;
  dueDate: string;
  dunningStage: number;
  dunningCompleted: boolean;
  recurring?: boolean;
  recurringFrequency?: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([{ description: "", quantity: 1, rate: 0 }]);
  const [currency, setCurrency] = useState("USD");
  const [taxPercent, setTaxPercent] = useState(0);
  const [feeAbsorbed, setFeeAbsorbed] = useState(false);
  const [notes, setNotes] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");
  const [recurringEndDate, setRecurringEndDate] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [saveTemplateName, setSaveTemplateName] = useState("");

  useEffect(() => { fetchInvoices(); }, [filter]);

  const fetchTemplates = async () => {
    const res = await fetch("/api/invoice-templates");
    const data = await res.json();
    setTemplates(data.templates || []);
  };

  const loadTemplate = (id: string) => {
    const t = templates.find((t) => t.id === id);
    if (!t) return;
    setItems(t.items.map((i: any) => ({ description: i.description, quantity: i.quantity, rate: i.rate })));
    setCurrency(t.currency || "USD");
    setNotes(t.notes || "");
  };

  const saveTemplate = async () => {
    if (!saveTemplateName.trim() || !items.some((i) => i.description)) return;
    await fetch("/api/invoice-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: saveTemplateName, items: items.filter((i) => i.description), currency, notes }),
    });
    setSaveTemplateName("");
    fetchTemplates();
  };

  const fetchInvoices = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set("status", filter);
    const res = await fetch(`/api/invoices?${params}`);
    const data = await res.json();
    setInvoices(data.invoices || []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName, clientEmail, clientCompany, dueDate, currency,
        taxPercent, feeAbsorbed, notes,
        recurring, recurringFrequency,
        recurringEndDate: recurringEndDate || null,
        items: items.filter((i) => i.description),
      }),
    });
    setShowNewForm(false);
    resetForm();
    fetchInvoices();
  };

  const resetForm = () => {
    setClientName(""); setClientEmail(""); setClientCompany("");
    setDueDate(""); setItems([{ description: "", quantity: 1, rate: 0 }]);
    setCurrency("USD"); setTaxPercent(0); setFeeAbsorbed(false); setNotes("");
    setRecurring(false); setRecurringFrequency("monthly"); setRecurringEndDate("");
  };

  const addItem = () => setItems([...items, { description: "", quantity: 1, rate: 0 }]);

  const subtotal = items.reduce((s, i) => s + i.quantity * i.rate * 100, 0);
  const taxAmt = Math.round(subtotal * (taxPercent / 100));
  const total = subtotal + taxAmt;
  const fee = Math.round(total * 0.025);
  const statusColors: Record<string, string> = {
    DRAFT: "border-zinc-500/30 text-zinc-400 bg-zinc-500/10",
    SENT: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    VIEWED: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
    PAID: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    PARTIALLY_PAID: "border-yellow-500/30 text-yellow-400 bg-yellow-500/10",
    OVERDUE: "border-orange-500/30 text-orange-400 bg-orange-500/10",
    DUNNING_ACTIVE: "border-pink-500/30 text-pink-400 bg-pink-500/10",
    VOIDED: "border-red-500/30 text-red-400 bg-red-500/10",
    SETTLED: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Invoices</h1>
        <button onClick={() => { setShowNewForm(true); fetchTemplates(); }} className="brutal-btn-primary px-6 py-3 text-sm">+ New Invoice</button>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {["", "DRAFT", "SENT", "OVERDUE", "DUNNING_ACTIVE", "PAID"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-all ${filter === s ? "border-pink-500 bg-pink-500/10 text-pink-400" : "border-white/10 text-zinc-500 hover:text-white"}`}>
            {s || "All"}
          </button>
        ))}
      </div>
      <div className="brutal-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
                <th className="text-left px-6 py-3 font-normal">#</th>
                <th className="text-left px-6 py-3 font-normal">Client</th>
                <th className="text-left px-6 py-3 font-normal">Amount</th>
                <th className="text-left px-6 py-3 font-normal">Status</th>
                <th className="text-left px-6 py-3 font-normal hidden sm:table-cell">Due</th>
                <th className="text-left px-6 py-3 font-normal hidden md:table-cell">Dunning</th>
                <th className="text-right px-6 py-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-mono text-xs">Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-mono text-xs">No invoices yet</td></tr>
              ) : invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => router.push(`/invoices/${inv.id}`)}>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                    {inv.invoiceNumber}
                    {(inv as any).recurring && <span className="ml-1.5 text-[9px] uppercase tracking-wider text-pink-400 border border-pink-500/30 px-1 py-0.5">R</span>}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{inv.clientName}</td>
                  <td className="px-6 py-4 font-mono">${(inv.total / 100).toLocaleString()} <span className="text-[10px] text-zinc-500">{inv.currency}</span></td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase border ${statusColors[inv.status] || statusColors.DRAFT}`}>{inv.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500 hidden sm:table-cell">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-xs text-zinc-500 font-mono">{inv.dunningCompleted ? "Completed" : `Stage ${inv.dunningStage}/4`}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/invoices/${inv.id}`); }}
                      className="text-xs font-mono text-pink-400 hover:text-pink-300 uppercase tracking-wider">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
{showNewForm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center p-4 pt-12 overflow-y-auto">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold uppercase tracking-tight">New Invoice</h2>
              <button onClick={() => setShowNewForm(false)} className="text-zinc-500 hover:text-white text-lg">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Client Name</label>
                  <input className="brutal-input" value={clientName} onChange={(e) => setClientName(e.target.value)} required placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Client Email</label>
                  <input className="brutal-input" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required placeholder="billing@acme.com" />
                </div>
              </div>
<div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Company</label>
                  <input className="brutal-input" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Due Date</label>
                  <input className="brutal-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Line Items</label>
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
                    <div className="col-span-6">
                      <input className="brutal-input" placeholder="Description" value={item.description}
                        onChange={(e) => { const n = [...items]; n[idx].description = e.target.value; setItems(n); }} />
                    </div>
                    <div className="col-span-2">
                      <input className="brutal-input" type="number" min="1" placeholder="Qty" value={item.quantity}
                        onChange={(e) => { const n = [...items]; n[idx].quantity = parseFloat(e.target.value) || 1; setItems(n); }} />
                    </div>
                    <div className="col-span-3">
                      <input className="brutal-input" type="number" min="0" step="0.01" placeholder="Rate" value={item.rate}
                        onChange={(e) => { const n = [...items]; n[idx].rate = parseFloat(e.target.value) || 0; setItems(n); }} />
                    </div>
                    <div className="col-span-1 flex items-center">
                      {idx === items.length - 1
                        ? <button type="button" onClick={addItem} className="text-pink-400 text-lg">+</button>
                        : <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-400 text-sm">✕</button>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Currency</label>
                  <select className="brutal-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Tax %</label>
                  <input className="brutal-input" type="number" min="0" max="50" step="0.1" value={taxPercent} onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={feeAbsorbed} onChange={(e) => setFeeAbsorbed(e.target.checked)} className="w-4 h-4 accent-pink-500" />
                    <span className="text-xs text-zinc-400 font-mono">Absorb fee</span>
                  </label>
                </div>
              </div>
              <div className="bg-black/50 border border-white/10 px-4 py-3 space-y-1">
                <div className="flex justify-between text-sm text-zinc-400 font-mono">
                  <span>Subtotal</span><span>${(subtotal / 100).toFixed(2)}</span>
                </div>
                {taxPercent > 0 && (
                  <div className="flex justify-between text-sm text-zinc-400 font-mono">
                    <span>Tax ({taxPercent}%)</span><span>${(taxAmt / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-zinc-400 font-mono">
                  <span>Platform Fee (2.5%)</span><span className="text-pink-400">${(fee / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white border-t border-white/10 pt-1 mt-1">
                  <span>{feeAbsorbed ? "Client Pays" : "You Receive"}</span>
                  <span className="text-pink-400">${(feeAbsorbed ? total / 100 : (total - fee) / 100).toFixed(2)}</span>
                </div>
              </div>
              {/* Recurring toggle */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)}
                    className="w-4 h-4 accent-pink-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Recurring Invoice</span>
                </label>
                {recurring && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Frequency</label>
                      <select className="brutal-input" value={recurringFrequency} onChange={(e) => setRecurringFrequency(e.target.value)}>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Biweekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">End Date (optional)</label>
                      <input className="brutal-input" type="date" value={recurringEndDate} onChange={(e) => setRecurringEndDate(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
              {/* Templates section */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-2 block">Templates</label>
                <div className="flex gap-2 mb-2">
                  <select className="brutal-input flex-1" value={selectedTemplate} onChange={(e) => { setSelectedTemplate(e.target.value); if (e.target.value) loadTemplate(e.target.value); }}>
                    <option value="">Load a template...</option>
                    {templates.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <input className="brutal-input w-40" placeholder="Save as..." value={saveTemplateName}
                    onChange={(e) => setSaveTemplateName(e.target.value)} />
                  <button type="button" onClick={saveTemplate} disabled={!saveTemplateName.trim() || !items.some((i) => i.description)}
                    className="brutal-btn-ghost px-3 py-2 text-xs disabled:opacity-30 whitespace-nowrap">Save</button>
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1 block">Notes</label>
                <textarea className="brutal-input min-h-[60px] resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment terms..." />
              </div>
              <button type="submit" className="brutal-btn-primary w-full py-4 text-sm">→ Create Invoice</button>
            </form>
          </div>
        </div>
)}
    </div>
  );
}

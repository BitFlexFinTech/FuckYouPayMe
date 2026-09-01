"use client";

import { useAppState } from "@/context/AppContext";

export default function NotificationBanner() {
  const { state, dispatch } = useAppState();

  const unread = state.notifications.filter((n) => !n.read);

  if (unread.length === 0) return null;

  const handleDismiss = (id: string) => {
    dispatch({ type: "DISMISS_NOTIFICATION", payload: id });
  };

  return (
    <div className="space-y-2 mb-6">
      {unread.map((n) => (
        <div
          key={n.id}
          className={`flex items-start justify-between gap-4 px-5 py-3 border text-sm ${
            n.type === "broadcast"
              ? "bg-pink-500/10 border-pink-500/30 text-pink-300"
              : n.type === "payment"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-zinc-800 border-zinc-700 text-zinc-300"
          }`}
        >
          <div className="flex-1">
            <span className="font-mono text-[10px] uppercase tracking-wider opacity-60 block mb-1">
              {n.type}
            </span>
            {n.message}
          </div>
          <button
            onClick={() => handleDismiss(n.id)}
            className="text-zinc-500 hover:text-white text-sm shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
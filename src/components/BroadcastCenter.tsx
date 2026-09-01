"use client";

import { useState } from "react";
import { useAppState } from "@/context/AppContext";

export default function BroadcastCenter() {
  const { state, dispatch } = useAppState();
  const [message, setMessage] = useState("");

  const handleBroadcast = () => {
    if (!message.trim()) return;
    dispatch({ type: "BROADCAST_MESSAGE", payload: message.trim() });
    setMessage("");
  };

  return (
    <div className="brutal-card p-6">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1">
        Broadcast Center
      </div>
      <div className="text-lg font-bold uppercase tracking-tight mb-4 text-white">
        Send Platform Notification
      </div>
      <textarea
        className="brutal-input min-h-[100px] resize-none mb-4"
        placeholder="Type your broadcast message to all freelancers..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && e.metaKey && handleBroadcast()}
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-600 font-mono">
          {message.length} chars · ⌘+Enter to send
        </span>
        <button
          onClick={handleBroadcast}
          disabled={!message.trim()}
          className="brutal-btn-primary px-6 py-3 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          📢 Broadcast
        </button>
      </div>
      {state.broadcastMessages.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-mono mb-2">
            Broadcast History ({state.broadcastMessages.length})
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {state.broadcastMessages.map((msg, i) => (
              <div key={i} className="text-xs text-zinc-400 font-mono bg-black/30 px-3 py-2 border-l-2 border-pink-500/50">
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
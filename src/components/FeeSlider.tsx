"use client";

import { useAppState } from "@/context/AppContext";
import { useState } from "react";

export default function FeeSlider() {
  const { state, dispatch } = useAppState();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(state.adminFeePercent));

  const handleSliderChange = (val: number) => {
    dispatch({ type: "SET_ADMIN_FEE", payload: val });
    setEditValue(String(val));
  };

  const handleInputSave = () => {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val >= 0 && val <= 25) {
      dispatch({ type: "SET_ADMIN_FEE", payload: val });
    } else {
      setEditValue(String(state.adminFeePercent));
    }
    setEditing(false);
  };

  return (
    <div className="brutal-card p-6">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1">
        Platform Take Rate
      </div>
      <div className="text-4xl font-black tracking-tighter text-pink-500 mb-6">
        {state.adminFeePercent}%
      </div>
      <input
        type="range"
        min="0"
        max="25"
        step="0.1"
        value={state.adminFeePercent}
        onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-zinc-800 appearance-none cursor-pointer accent-pink-500 mb-6"
        style={{
          background: `linear-gradient(to right, #FF0080 ${state.adminFeePercent / 25 * 100}%, #27272a ${state.adminFeePercent / 25 * 100}%)`,
        }}
      />
      <div className="flex justify-between text-xs text-zinc-600 font-mono mb-4">
        <span>0%</span>
        <span>25% (hard cap)</span>
      </div>
      {editing ? (
        <div className="flex gap-2">
          <input
            className="brutal-input flex-1"
            type="number"
            min="0"
            max="25"
            step="0.1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInputSave()}
            autoFocus
          />
          <button onClick={handleInputSave} className="brutal-btn-primary px-4 text-xs">Save</button>
          <button onClick={() => { setEditing(false); setEditValue(String(state.adminFeePercent)); }} className="brutal-btn-ghost px-4 text-xs">Cancel</button>
        </div>
      ) : (
        <button
          onClick={() => { setEditing(true); setEditValue(String(state.adminFeePercent)); }}
          className="brutal-btn-ghost w-full py-3 text-xs"
        >
          ✎ Fine-tune
        </button>
      )}
      <div className="mt-4 text-xs text-zinc-500 leading-relaxed">
        On a $10,000 invoice at {state.adminFeePercent}%, the platform collects{" "}
        <span className="text-pink-400 font-mono">${(10000 * state.adminFeePercent / 100).toFixed(2)}</span>.
      </div>
    </div>
  );
}
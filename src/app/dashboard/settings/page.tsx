"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [totpSetup, setTotpSetup] = useState<any>(null);
  const [totpCode, setTotpCode] = useState("");
  const [totpError, setTotpError] = useState("");
  const [totpSuccess, setTotpSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);

  const handleSetupTotp = async () => {
    setLoading(true);
    setTotpError("");
    setTotpSuccess("");
    try {
      const res = await fetch("/api/auth/totp/setup");
      const data = await res.json();
      setTotpSetup(data);
    } catch { setTotpError("Failed to start TOTP setup"); }
    setLoading(false);
  };

  const handleVerifyTotp = async () => {
    if (!totpCode.trim() || !totpSetup) return;
    setLoading(true);
    setTotpError("");
    try {
      const res = await fetch("/api/auth/totp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: totpCode, secret: totpSetup.secret }),
      });
      if (res.ok) {
        setTotpSuccess("Two-factor authentication enabled!");
        setTotpEnabled(true);
        setTotpSetup(null);
        setTotpCode("");
      } else {
        const data = await res.json();
        setTotpError(data.error || "Invalid code");
      }
    } catch { setTotpError("Verification failed"); }
    setLoading(false);
  };

  const handleDisableTotp = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/totp/disable", { method: "POST" });
      setTotpEnabled(false);
      setTotpSuccess("Two-factor authentication disabled.");
    } catch { setTotpError("Failed to disable"); }
    setLoading(false);
  };

  useEffect(() => {
    setPushSupported("serviceWorker" in navigator && "PushManager" in window);
    setPushEnabled(document.documentElement.dataset.pushSubscribed === "true");
  }, []);

  const handleSubscribePush = async () => {
    if (!pushSupported) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: "BIC_fake-vapid-public-key-for-development-only",
      });
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      setPushEnabled(true);
    } catch (e) { console.error("Push subscribe failed:", e); }
  };

  const handleUnsubscribePush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      await fetch("/api/notifications/subscribe", { method: "DELETE" });
      setPushEnabled(false);
    } catch (e) { console.error("Push unsubscribe failed:", e); }
  };

  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="brutal-card p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-4">Security</div>
          <h2 className="text-lg font-bold uppercase tracking-tight mb-2">Two-Factor Authentication</h2>
          <p className="text-sm text-zinc-400 mb-4 font-light">Add extra security with TOTP via Google Authenticator, Authy, or any authenticator app.</p>

          {totpSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 text-sm mb-4">{totpSuccess}</div>
          )}
          {totpError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm mb-4">{totpError}</div>
          )}

          {!totpEnabled && !totpSetup && (
            <button onClick={handleSetupTotp} disabled={loading}
              className="brutal-btn-primary px-6 py-3 text-sm disabled:opacity-50">
              {loading ? "Starting..." : "Enable 2FA"}
            </button>
          )}

          {totpSetup && (
            <div>
              <p className="text-sm text-zinc-300 mb-3">Scan this QR code with your authenticator app:</p>
              <div className="bg-white p-4 inline-block mb-3 rounded">
                <img src={totpSetup.qrCodeUrl} alt="TOTP QR Code" className="w-40 h-40" />
              </div>
              <p className="text-[10px] text-zinc-500 font-mono mb-3 break-all">Secret: {totpSetup.secret}</p>
              <div className="flex gap-2">
                <input className="brutal-input flex-1" type="text" inputMode="numeric" placeholder="000000"
                  value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
                <button onClick={handleVerifyTotp} disabled={loading || totpCode.length !== 6}
                  className="brutal-btn-primary px-4 py-3 text-xs disabled:opacity-50">
                  {loading ? "..." : "Verify"}
                </button>
              </div>
            </div>
          )}

          {totpEnabled && !totpSetup && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-emerald-400 text-lg">&#9989;</span>
                <span className="text-sm text-emerald-400 font-mono">Two-factor authentication is active</span>
              </div>
              <button onClick={handleDisableTotp} disabled={loading}
                className="brutal-btn-ghost px-4 py-2 text-xs text-red-400 disabled:opacity-50">
                Disable 2FA
              </button>
            </div>
          )}
        </div>

        <div className="brutal-card p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-4">Notifications</div>
          <h2 className="text-lg font-bold uppercase tracking-tight mb-2">Push Notifications</h2>
          <p className="text-sm text-zinc-400 mb-4 font-light">Get notified instantly when a client pays or files a dispute.</p>
          {!pushSupported && <p className="text-xs text-zinc-600 font-mono">Not supported in this browser.</p>}
          {pushSupported && !pushEnabled && (
            <button onClick={handleSubscribePush} className="brutal-btn-primary px-6 py-3 text-sm">Enable Push Notifications</button>
          )}
          {pushSupported && pushEnabled && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-emerald-400 text-lg">&#9989;</span>
                <span className="text-sm text-emerald-400 font-mono">Push notifications are active</span>
              </div>
              <button onClick={handleUnsubscribePush} className="brutal-btn-ghost px-4 py-2 text-xs text-red-400">Disable</button>
            </div>
          )}
        </div>

        <div className="brutal-card p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono mb-4">Account</div>
          <div className="space-y-3 text-sm">
            <div><span className="text-zinc-400">Email</span><p className="text-white font-mono">{session?.user?.email}</p></div>
            <div><span className="text-zinc-400">Role</span><p className="text-white capitalize">{((session?.user as any)?.role || "").toLowerCase()}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
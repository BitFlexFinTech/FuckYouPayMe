"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          console.log("[PWA] Service worker registered");
        })
        .catch((err) => {
          console.error("[PWA] Service worker registration failed:", err);
        });
    }
  }, []);

  // Get push subscription status
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager
          .getSubscription()
          .then((sub) => {
            // Store subscription status in a data attribute
            document.documentElement.dataset.pushSubscribed = sub ? "true" : "false";
          })
          .catch(() => {});
      });
    }
  }, []);

  return null; // This component does not render anything
}
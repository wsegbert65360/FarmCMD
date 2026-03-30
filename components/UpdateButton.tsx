"use client";

import { useState, useEffect } from "react";

export default function UpdateButton() {
  const [status, setStatus] = useState<"idle" | "checking" | "updated" | "error">("idle");
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          setSwReady(true);

          // Listen for RELOAD message from service worker
          navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data?.type === "RELOAD") {
              // Give the SW a moment to take control, then reload
              setTimeout(() => window.location.reload(), 500);
            }
          });

          // Also listen for SW update found (auto-detect on load)
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "activated") {
                  setStatus("updated");
                }
              });
            }
          });
        })
        .catch(() => {
          // SW registration failed — button still visible but non-functional
          console.info("Service worker not available");
        });
    }
  }, []);

  const handleUpdate = async () => {
    if (!swReady) return;
    setStatus("checking");

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        setStatus("error");
        return;
      }

      // Tell the SW to wipe its cache
      reg.active?.postMessage({ type: "UPDATE" });

      // Also try to check for a new version of the SW itself
      await reg.update();

      // If no update is found, we still wiped the page cache,
      // so force a reload after a brief moment
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <button
      onClick={handleUpdate}
      disabled={status === "checking"}
      className={`w-full py-2.5 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
        status === "checking"
          ? "bg-blue-100 text-blue-600 cursor-wait"
          : status === "updated"
          ? "bg-green-100 text-green-700"
          : status === "error"
          ? "bg-red-100 text-red-600"
          : "bg-white border border-slate-200 text-slate-500 shadow-sm hover:bg-slate-50 active:bg-slate-100"
      }`}
    >
      {status === "idle" && (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Check for Updates
        </>
      )}
      {status === "checking" && (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Checking…
        </>
      )}
      {status === "updated" && (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Updated — reloading…
        </>
      )}
      {status === "error" && "Update failed — try again"}
    </button>
  );
}

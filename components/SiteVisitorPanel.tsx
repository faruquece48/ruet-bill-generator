"use client";

import { useEffect, useState } from "react";
import { Eye, Globe2, Sun } from "lucide-react";

const emptyCounts = { live: 0, today: 0, total: 0 };
const sessionKey = "ruet-visitor-session";
const visitKey = "ruet-visitor-visit";

type VisitorWindow = Window & {
  __ruetVisitorIds?: { sessionId: string; visitId: string };
};

export default function SiteVisitorPanel() {
  const [counts, setCounts] = useState(emptyCounts);

  useEffect(() => {
    const visitorWindow = window as VisitorWindow;
    let ids = visitorWindow.__ruetVisitorIds;
    if (!ids) {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const isRefresh = navigation?.type === "reload";
      const savedSessionId = sessionStorage.getItem(sessionKey);
      const savedVisitId = sessionStorage.getItem(visitKey);
      ids = {
        sessionId: isRefresh && savedSessionId ? savedSessionId : crypto.randomUUID(),
        visitId: isRefresh && savedVisitId ? savedVisitId : crypto.randomUUID(),
      };
      visitorWindow.__ruetVisitorIds = ids;
      const { sessionId, visitId } = ids;
      sessionStorage.setItem(sessionKey, sessionId);
      sessionStorage.setItem(visitKey, visitId);
    }
    const { sessionId, visitId } = ids;
    const update = async (action: "visit" | "heartbeat" = "heartbeat", visitId?: string) => {
      try {
        const response = await fetch("/api/visitors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, visitId, action }), cache: "no-store" });
        if (response.ok) setCounts(await response.json());
      } catch { /* Keep the last successful counts while temporarily offline. */ }
    };
    void update("visit", visitId);
    const leave = () => navigator.sendBeacon("/api/visitors", new Blob([JSON.stringify({ sessionId, action: "leave" })], { type: "application/json" }));
    window.addEventListener("pagehide", leave);
    const timer = window.setInterval(update, 15_000);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pagehide", leave);
    };
  }, []);

  return <div className="overflow-hidden rounded-2xl border border-cyan-300/25 bg-transparent p-3">
    <h2 className="flex items-center gap-2 text-xs font-bold tracking-wide text-white"><Eye className="h-4 w-4 text-lime-300" />SITE VISITORS</h2>
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between rounded-full border border-cyan-100/90 bg-slate-950/35 px-4 py-2 text-sm"><span className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Live Now</span><strong className="text-emerald-300">{counts.live.toLocaleString()}</strong></div>
      <div className="flex items-center justify-between rounded-full border border-cyan-100/90 bg-slate-950/35 px-4 py-2 text-sm"><span className="flex items-center gap-3"><Sun className="h-3.5 w-3.5 text-yellow-300" />Today</span><strong className="text-yellow-300">{counts.today.toLocaleString()}</strong></div>
      <div className="flex items-center justify-between rounded-full border border-cyan-100/90 bg-slate-950/35 px-4 py-2 text-sm"><span className="flex items-center gap-3"><Globe2 className="h-3.5 w-3.5 text-cyan-200" />Total</span><strong className="text-cyan-200">{counts.total.toLocaleString()}</strong></div>
    </div>
  </div>;
}

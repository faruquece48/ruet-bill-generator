import { NextResponse } from "next/server";

type VisitorStore = {
  day: string;
  today: Set<string>;
  total: Set<string>;
  live: Map<string, number>;
};

const globalVisitors = globalThis as typeof globalThis & { visitorStore?: VisitorStore };
const todayKey = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());
const store = globalVisitors.visitorStore ??= { day: todayKey(), today: new Set(), total: new Set(), live: new Map() };

function snapshot() {
  const now = Date.now();
  const day = todayKey();
  if (store.day !== day) {
    store.day = day;
    store.today.clear();
  }
  for (const [id, lastSeen] of store.live) if (now - lastSeen > 35_000) store.live.delete(id);
  return { live: store.live.size, today: store.today.size, total: store.total.size };
}

export async function GET() {
  return NextResponse.json(snapshot(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { sessionId?: string; action?: "heartbeat" | "leave" } | null;
  const sessionId = body?.sessionId?.slice(0, 100);
  if (!sessionId) return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
  if (body?.action === "leave") {
    store.live.delete(sessionId);
    return NextResponse.json(snapshot(), { headers: { "Cache-Control": "no-store" } });
  }
  store.live.set(sessionId, Date.now());
  store.today.add(sessionId);
  store.total.add(sessionId);
  return NextResponse.json(snapshot(), { headers: { "Cache-Control": "no-store" } });
}

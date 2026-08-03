import { NextResponse } from "next/server";
import { ensureVisitorSchema, prisma } from "@/lib/prisma";

const todayKey = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());

async function snapshot() {
  await ensureVisitorSchema();
  const [live, today, total] = await prisma.$transaction([
    prisma.visitorSession.count({ where: { lastSeenAt: { gte: new Date(Date.now() - 35_000) } } }),
    prisma.visitorSession.count({ where: { lastSeenDay: todayKey() } }),
    prisma.visitorSession.count(),
  ]);
  return { live, today, total };
}

export async function GET() {
  return NextResponse.json(await snapshot(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  await ensureVisitorSchema();
  const body = await request.json().catch(() => null) as { sessionId?: string; action?: "heartbeat" | "leave" } | null;
  const sessionId = body?.sessionId?.slice(0, 100);
  if (!sessionId) return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
  if (body?.action === "leave") {
    await prisma.visitorSession.updateMany({
      where: { id: sessionId },
      data: { lastSeenAt: new Date(0) },
    });
    return NextResponse.json(await snapshot(), { headers: { "Cache-Control": "no-store" } });
  }
  const now = new Date();
  await prisma.visitorSession.upsert({
    where: { id: sessionId },
    create: { id: sessionId, firstSeenAt: now, lastSeenAt: now, lastSeenDay: todayKey() },
    update: { lastSeenAt: now, lastSeenDay: todayKey() },
  });
  return NextResponse.json(await snapshot(), { headers: { "Cache-Control": "no-store" } });
}

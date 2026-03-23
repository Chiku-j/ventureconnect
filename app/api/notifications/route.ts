import { NextRequest, NextResponse } from "next/server";

interface Notification {
  id: string;
  message: string;
  targetRole: "startup" | "vc";
  read: boolean;
  createdAt: string;
}

// Simple global in-memory store
const notifications: Notification[] = [
  {
    id: "init-1",
    message: "Welcome to VentureConnect! Your profile is ready.",
    targetRole: "startup",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "init-2",
    message: "3 new startups match your investment thesis this week.",
    targetRole: "vc",
    read: false,
    createdAt: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") as "startup" | "vc" | null;
  const filtered = role ? notifications.filter((n) => n.targetRole === role) : notifications;
  return NextResponse.json({ notifications: filtered });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.action === "markRead") {
    const n = notifications.find((x) => x.id === body.id);
    if (n) n.read = true;
    return NextResponse.json({ ok: true });
  }

  if (body.action === "markAllRead") {
    const role = body.role as "startup" | "vc";
    notifications.filter((n) => n.targetRole === role).forEach((n) => (n.read = true));
    return NextResponse.json({ ok: true });
  }

  if (body.action === "push") {
    notifications.push({
      id: `notif-${Date.now()}`,
      message: body.message,
      targetRole: body.targetRole,
      read: false,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

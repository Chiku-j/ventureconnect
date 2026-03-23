import { NextRequest, NextResponse } from "next/server";
import { Submission, SubmissionStatus } from "@/lib/types";

// In-memory store
const submissions: Submission[] = [];
let notificationBus: Array<{ id: string; message: string; targetRole: "startup" | "vc"; read: boolean; createdAt: string }> = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startupId = searchParams.get("startupId");
  const vcId = searchParams.get("vcId");

  if (startupId) {
    return NextResponse.json({ submissions: submissions.filter((s) => s.startupId === startupId) });
  }
  if (vcId) {
    return NextResponse.json({ submissions: submissions.filter((s) => s.vcId === vcId) });
  }
  return NextResponse.json({ submissions });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.action === "submit") {
    const existing = submissions.find((s) => s.startupId === body.startupId && s.vcId === body.vcId);
    if (existing) return NextResponse.json({ submission: existing });

    const sub: Submission = {
      id: `sub-${Date.now()}`,
      startupId: body.startupId,
      vcId: body.vcId,
      vcName: body.vcName,
      status: "Submitted",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    submissions.push(sub);
    return NextResponse.json({ submission: sub });
  }

  if (body.action === "updateStatus") {
    const sub = submissions.find((s) => s.id === body.submissionId);
    if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
    sub.status = body.status as SubmissionStatus;
    sub.updatedAt = new Date().toISOString();
    if (body.notes) sub.vcNotes = body.notes;
    if (body.comment) sub.vcComment = body.comment;

    // Push notification
    notificationBus.push({
      id: `notif-${Date.now()}`,
      message: `${body.vcName || "A VC"} updated your deck status to "${body.status}"`,
      targetRole: "startup",
      read: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ submission: sub });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

// Export notification bus for reuse
export { notificationBus };

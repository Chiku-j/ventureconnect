import { NextRequest, NextResponse } from "next/server";
import { CRMContact, CRMStatus, CRMActivity, CRMTemplate } from "@/lib/types";

// ─── In-Memory Stores ─────────────────────────────────────────────────────────

const contacts: Map<string, CRMContact> = new Map();

// Seed templates
export const CRM_TEMPLATES: CRMTemplate[] = [
  {
    id: "t1",
    name: "Cold Intro — Founder-First",
    subject: "{{founderName}} + {{vcName}} — Quick intro?",
    body: `Hi {{partnerName}},

My name is {{founderName}}, founder of {{company}} — we're building {{tagline}}.

We're currently raising {{askAmount}} at {{stage}} and I believe {{vcName}}'s thesis around {{sector}} aligns closely with what we're building.

Would love 20 mins to share our progress and get your perspective.

Best,
{{founderName}}`,
  },
  {
    id: "t2",
    name: "Warm — Traction-Led",
    subject: "{{company}} — {{arr}} ARR, growing {{growthRate}}",
    body: `Hi {{partnerName}},

{{company}} ({{tagline}}) has hit {{arr}} ARR with {{growthRate}} MoM growth. We're raising {{askAmount}} to accelerate GTM.

Given {{vcName}}'s portfolio in {{sector}}, I thought this would be worth a conversation.

Happy to share our AI-generated investor report. Interested?

{{founderName}}
Co-founder, {{company}}`,
  },
  {
    id: "t3",
    name: "Short & Sharp",
    subject: "3 lines on {{company}}",
    body: `Hi {{partnerName}},

1/ {{company}} — {{tagline}}
2/ Raising {{askAmount}} ({{stage}}), {{growthRate}} MoM growth
3/ Would love 15 mins. Worth a quick call?

{{founderName}}`,
  },
  {
    id: "t4",
    name: "Follow-Up (No Response)",
    subject: "Re: {{company}} — just following up",
    body: `Hi {{partnerName}},

Following up on my earlier note about {{company}}. I know inboxes get busy.

We've made some interesting progress since: {{keyMetric}}.

Happy to send our full investor report if useful.

{{founderName}}`,
  },
  {
    id: "t5",
    name: "Meeting Request — Post Signal",
    subject: "Meeting request — {{company}} × {{vcName}}",
    body: `Hi {{partnerName}},

Thank you for the kind reply! I'd love to schedule a proper conversation.

{{company}} overview:
- Stage: {{stage}}
- Raise: {{askAmount}}
- Traction: {{arr}} ARR, {{growthRate}} MoM
- Model: {{bizModel}}

Does any slot this week work for a 30-min call?

{{founderName}}`,
  },
];

export const CRM_TEMPLATES_MAP: Record<string, CRMTemplate> = Object.fromEntries(
  CRM_TEMPLATES.map((t) => [t.id, t])
);

// ─── Route Handlers ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "templates") {
    return NextResponse.json({ templates: CRM_TEMPLATES });
  }

  return NextResponse.json({ contacts: [...contacts.values()] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === "add") {
    const { vcId, vcName } = body;
    if (!contacts.has(vcId)) {
      const newContact: CRMContact = {
        id: `crm-${vcId}`,
        vcId,
        vcName,
        status: "Not Contacted",
        lastActivity: new Date().toISOString(),
        notes: "",
        timeline: [{
          id: `act-${Date.now()}`,
          type: "status_change",
          description: "Added to CRM",
          timestamp: new Date().toISOString(),
        }],
      };
      contacts.set(vcId, newContact);
    }
    return NextResponse.json({ contact: contacts.get(vcId) });
  }

  if (action === "addBulk") {
    const { vcs } = body as { vcs: { vcId: string; vcName: string }[] };
    for (const { vcId, vcName } of vcs) {
      if (!contacts.has(vcId)) {
        contacts.set(vcId, {
          id: `crm-${vcId}`,
          vcId,
          vcName,
          status: "Not Contacted",
          lastActivity: new Date().toISOString(),
          notes: "",
          timeline: [{
            id: `act-${Date.now()}`,
            type: "status_change",
            description: "Added to CRM via Sequence Builder",
            timestamp: new Date().toISOString(),
          }],
        });
      }
    }
    return NextResponse.json({ added: vcs.length });
  }

  if (action === "updateStatus") {
    const { vcId, status, note } = body as { vcId: string; status: CRMStatus; note?: string };
    const contact = contacts.get(vcId);
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
    contact.status = status;
    contact.lastActivity = new Date().toISOString();
    const act: CRMActivity = {
      id: `act-${Date.now()}`,
      type: "status_change",
      description: `Status changed to "${status}"${note ? `: ${note}` : ""}`,
      timestamp: new Date().toISOString(),
    };
    contact.timeline.unshift(act);
    contacts.set(vcId, contact);
    return NextResponse.json({ contact });
  }

  if (action === "addNote") {
    const { vcId, note } = body;
    const contact = contacts.get(vcId);
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
    contact.notes = note;
    const act: CRMActivity = {
      id: `act-${Date.now()}`,
      type: "note",
      description: `Note: ${note.slice(0, 60)}...`,
      timestamp: new Date().toISOString(),
    };
    contact.timeline.unshift(act);
    contacts.set(vcId, contact);
    return NextResponse.json({ contact });
  }

  if (action === "useTemplate") {
    const { vcId, templateId } = body;
    const contact = contacts.get(vcId);
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const template = CRM_TEMPLATES_MAP[templateId];
    contact.templateUsed = template?.name;
    contact.status = "Email Sent";
    const act: CRMActivity = {
      id: `act-${Date.now()}`,
      type: "email",
      description: `Email sent using template: "${template?.name}"`,
      timestamp: new Date().toISOString(),
    };
    contact.timeline.unshift(act);
    contacts.set(vcId, contact);
    return NextResponse.json({ contact });
  }

  if (action === "setFollowUp") {
    const { vcId, date } = body;
    const contact = contacts.get(vcId);
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
    contact.followUpDate = date;
    contacts.set(vcId, contact);
    return NextResponse.json({ contact });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

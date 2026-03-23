"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { CRMContact, CRMStatus, CRMTemplate, CRMActivity } from "@/lib/types";
import { X, Mail, ChevronRight, Clock, StickyNote, Calendar, CheckCircle2 } from "lucide-react";

const STATUSES: CRMStatus[] = ["Not Contacted","Email Sent","Replied","Meeting Scheduled","Passed","Ghosted"];

const STATUS_COLORS: Record<CRMStatus, { bg: string; text: string; border: string }> = {
  "Not Contacted":    { bg: "rgba(255,255,255,0.03)", text: "#6b7280", border: "rgba(255,255,255,0.08)" },
  "Email Sent":       { bg: "rgba(99,102,241,0.1)",  text: "#818cf8", border: "rgba(99,102,241,0.2)" },
  "Replied":          { bg: "rgba(59,130,246,0.1)",  text: "#60a5fa", border: "rgba(59,130,246,0.2)" },
  "Meeting Scheduled":{ bg: "rgba(34,197,94,0.1)",   text: "#4ade80", border: "rgba(34,197,94,0.2)" },
  "Passed":           { bg: "rgba(239,68,68,0.08)",  text: "#f87171", border: "rgba(239,68,68,0.2)" },
  "Ghosted":          { bg: "rgba(156,163,175,0.08)","text": "#9ca3af", border: "rgba(156,163,175,0.15)" },
};

const ACTIVITY_ICONS: Record<string, string> = {
  email: "📧", note: "📝", meeting: "🤝", status_change: "🔄",
};

function TemplateModal({ templates, onSelect, onClose, onboarding }: {
  templates: CRMTemplate[];
  onSelect: (t: CRMTemplate) => void;
  onClose: () => void;
  onboarding: Record<string, string>;
}) {
  const [preview, setPreview] = useState<CRMTemplate | null>(null);

  const fillTemplate = (body: string) =>
    body
      .replace(/\{\{founderName\}\}/g, onboarding.founderName || "Arjun")
      .replace(/\{\{company\}\}/g, onboarding.companyName || "Your Company")
      .replace(/\{\{tagline\}\}/g, onboarding.tagline || "")
      .replace(/\{\{askAmount\}\}/g, onboarding.askAmount || "")
      .replace(/\{\{stage\}\}/g, onboarding.fundingStage || "")
      .replace(/\{\{arr\}\}/g, onboarding.arr || "")
      .replace(/\{\{growthRate\}\}/g, onboarding.growthRate || "")
      .replace(/\{\{bizModel\}\}/g, onboarding.businessModel || "")
      .replace(/\{\{sector\}\}/g, onboarding.sector || "")
      .replace(/\{\{vcName\}\}/g, "{{vcName}}")
      .replace(/\{\{partnerName\}\}/g, "{{partnerName}}")
      .replace(/\{\{keyMetric\}\}/g, "25% MoM growth");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
      <div className="card fade-slide-up" style={{ width: 680, maxHeight: "85vh", overflow: "auto", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Email Templates</h3>
          <button className="btn-ghost" onClick={onClose} style={{ padding: 4 }}><X size={18} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, minHeight: 360 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setPreview(t)}
                style={{
                  padding: "10px 12px", borderRadius: 8, textAlign: "left", border: "none", cursor: "pointer",
                  background: preview?.id === t.id ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                  color: preview?.id === t.id ? "#818cf8" : "var(--text-secondary)",
                  fontSize: 12, fontWeight: 500, borderLeft: preview?.id === t.id ? "2px solid #6366f1" : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div>
            {preview ? (
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 4px" }}>SUBJECT</p>
                <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 14px", background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: 8 }}>
                  {fillTemplate(preview.subject)}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 4px" }}>BODY</p>
                <pre style={{ fontSize: 12, lineHeight: 1.7, fontFamily: "inherit", margin: "0 0 16px", whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: 8, color: "var(--text-secondary)" }}>
                  {fillTemplate(preview.body)}
                </pre>
                <button className="btn-primary" onClick={() => onSelect(preview)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Mail size={14} /> Use This Template
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: 13 }}>
                Select a template to preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactPanel({ contact, templates, onboarding, onUpdate, onClose }: {
  contact: CRMContact;
  templates: CRMTemplate[];
  onboarding: Record<string, string>;
  onUpdate: (c: CRMContact) => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<CRMStatus>(contact.status);
  const [notes, setNotes] = useState(contact.notes);
  const [followUp, setFollowUp] = useState(contact.followUpDate ?? "");
  const [showTemplates, setShowTemplates] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateStatus = async (s: CRMStatus) => {
    setStatus(s);
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateStatus", vcId: contact.vcId, status: s }),
    });
    const data = await res.json();
    onUpdate(data.contact);
  };

  const saveNotes = async () => {
    setSaving(true);
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addNote", vcId: contact.vcId, note: notes }),
    });
    const data = await res.json();
    onUpdate(data.contact);
    setSaving(false);
  };

  const useTemplate = async (t: CRMTemplate) => {
    setShowTemplates(false);
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "useTemplate", vcId: contact.vcId, templateId: t.id }),
    });
    const data = await res.json();
    onUpdate(data.contact);
  };

  const setFollowUpDate = async (date: string) => {
    setFollowUp(date);
    await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setFollowUp", vcId: contact.vcId, date }),
    });
  };

  const sc = STATUS_COLORS[status];

  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 0, width: 420,
      background: "#0e0e14", borderLeft: "1px solid var(--bg-border)",
      boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
      display: "flex", flexDirection: "column", zIndex: 150,
      animation: "slideInRight 0.2s ease",
    }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--bg-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 17, margin: "0 0 2px" }}>{contact.vcName}</h3>
          <span style={{ fontSize: 12, padding: "2px 10px", borderRadius: 20, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
            {status}
          </span>
        </div>
        <button className="btn-ghost" onClick={onClose} style={{ padding: 6 }}><X size={16} /></button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        {/* Status update */}
        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Update Status</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 20 }}>
          {STATUSES.map(s => {
            const c = STATUS_COLORS[s];
            return (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                style={{
                  padding: "7px 10px", borderRadius: 7, fontSize: 11, fontWeight: 500,
                  border: status === s ? `1px solid ${c.border}` : "1px solid rgba(255,255,255,0.06)",
                  background: status === s ? c.bg : "transparent",
                  color: status === s ? c.text : "var(--text-muted)",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Templates */}
        <button
          className="btn-secondary"
          onClick={() => setShowTemplates(true)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, marginBottom: 20 }}
        >
          <Mail size={13} /> Pick Email Template
        </button>
        {contact.templateUsed && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "-14px 0 16px", textAlign: "center" }}>
            Last used: <span style={{ color: "#818cf8" }}>{contact.templateUsed}</span>
          </p>
        )}

        {/* Follow-up date */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <Calendar size={11} style={{ display: "inline", marginRight: 4 }} /> Follow-up Reminder
          </label>
          <input
            type="date"
            className="input-base"
            value={followUp}
            onChange={e => setFollowUpDate(e.target.value)}
            style={{ fontSize: 13 }}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <StickyNote size={11} style={{ display: "inline", marginRight: 4 }} /> Private Notes
          </label>
          <textarea
            className="input-base"
            rows={4}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes visible only to you..."
            style={{ resize: "vertical", fontSize: 13, marginBottom: 8 }}
          />
          <button className="btn-secondary" onClick={saveNotes} style={{ width: "100%", fontSize: 13 }}>
            {saving ? "Saving..." : "Save Notes"}
          </button>
        </div>

        {/* Activity Timeline */}
        <div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <Clock size={11} style={{ display: "inline", marginRight: 4 }} /> Activity Timeline
          </p>
          {contact.timeline.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 12 }}>No activity yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {contact.timeline.map(act => (
                <div key={act.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 14, marginTop: 1 }}>{ACTIVITY_ICONS[act.type] ?? "•"}</span>
                  <div>
                    <p style={{ fontSize: 12, margin: 0, color: "var(--text-secondary)" }}>{act.description}</p>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "2px 0 0" }}>
                      {new Date(act.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showTemplates && (
        <TemplateModal
          templates={templates}
          onboarding={onboarding}
          onSelect={useTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
}

export default function CRMPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [templates, setTemplates] = useState<CRMTemplate[]>([]);
  const [active, setActive] = useState<CRMContact | null>(null);
  const [onboarding, setOnboarding] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [cRes, tRes] = await Promise.all([
      fetch("/api/crm"),
      fetch("/api/crm?action=templates"),
    ]);
    const cData = await cRes.json();
    const tData = await tRes.json();
    setContacts(cData.contacts ?? []);
    setTemplates(tData.templates ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const raw = localStorage.getItem("startup_onboarding");
    if (raw) setOnboarding(JSON.parse(raw));
  }, [load]);

  const contactsByStatus = (s: CRMStatus) => contacts.filter(c => c.status === s);

  const updateContact = (c: CRMContact) => {
    setContacts(prev => prev.map(x => x.vcId === c.vcId ? c : x));
    if (active?.vcId === c.vcId) setActive(c);
  };

  return (
    <AppShell role="startup" onRoleSwitch={() => router.push("/vc/onboarding")}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em", margin: "0 0 4px" }}>Outreach CRM</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
              {contacts.length} VCs tracked · Click any card to manage
            </p>
          </div>
          <button className="btn-secondary" onClick={() => router.push("/startup/vc-database")} style={{ fontSize: 13 }}>
            + Add VCs from Database
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", gap: 14 }}>
            {[...Array(6)].map((_, i) => <div key={i} className="card shimmer" style={{ width: 200, height: 300, flexShrink: 0 }} />)}
          </div>
        ) : contacts.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: "center" }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>📋</p>
            <h3 style={{ fontWeight: 700, margin: "0 0 8px" }}>Your CRM is empty</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 20px" }}>
              Go to the VC Database, select VCs, and add them to your sequence.
            </p>
            <button className="btn-primary" onClick={() => router.push("/startup/vc-database")}>
              Browse VC Database →
            </button>
          </div>
        ) : (
          /* Kanban board */
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 16 }}>
            {STATUSES.map(status => {
              const col = contactsByStatus(status);
              const sc = STATUS_COLORS[status];
              return (
                <div key={status} style={{ minWidth: 210, maxWidth: 210, flexShrink: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: sc.text }}>{status}</span>
                    <span style={{ fontSize: 11, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, borderRadius: 10, padding: "1px 7px" }}>
                      {col.length}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {col.map(c => (
                      <div
                        key={c.vcId}
                        className="card"
                        style={{ padding: 14, cursor: "pointer", border: active?.vcId === c.vcId ? `1px solid ${sc.border}` : "1px solid var(--bg-border)" }}
                        onClick={() => setActive(c)}
                      >
                        <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 4px" }}>{c.vcName}</p>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 8px" }}>
                          {new Date(c.lastActivity).toLocaleDateString()}
                        </p>
                        {c.followUpDate && (
                          <p style={{ fontSize: 10, color: "#fbbf24", margin: 0 }}>
                            🔔 Follow-up: {new Date(c.followUpDate).toLocaleDateString()}
                          </p>
                        )}
                        {c.templateUsed && (
                          <p style={{ fontSize: 10, color: "#818cf8", margin: "4px 0 0" }}>
                            📧 {c.templateUsed}
                          </p>
                        )}
                      </div>
                    ))}
                    {col.length === 0 && (
                      <div style={{ border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 10, padding: 16, textAlign: "center" }}>
                        <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0 }}>Empty</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {active && (
        <ContactPanel
          contact={active}
          templates={templates}
          onboarding={onboarding}
          onUpdate={updateContact}
          onClose={() => setActive(null)}
        />
      )}
    </AppShell>
  );
}

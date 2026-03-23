"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import AppShell from "@/components/layout/AppShell";
import FitScoreRing from "@/components/ui/FitScoreRing";
import { MOCK_STARTUPS } from "@/lib/mockStartups";
import { StartupProfile, VCPreferences, SubmissionStatus, AIReport } from "@/lib/types";
import { ArrowLeft, Download, MessageSquare, FileText, Save } from "lucide-react";

const STATUSES: SubmissionStatus[] = ["Submitted", "Under Review", "Interested", "Passed"];
const STATUS_COLORS: Record<string, string> = {
  "Submitted": "#818cf8", "Under Review": "#fbbf24", "Interested": "#4ade80", "Passed": "#f87171",
};

const DEFAULT_PREFS: VCPreferences = {
  vcId: "priya-vc", sectors: ["Fintech","SaaS"], stages: ["Seed","Series A"],
  ticketMin: 1, ticketMax: 10, geographies: ["India","Southeast Asia"],
  businessModels: ["B2B SaaS","Marketplace"], watchlist: [], dealNotes: {}, dealStatuses: {},
};

export default function StartupDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [startup, setStartup] = useState<StartupProfile | null>(null);
  const [report, setReport] = useState<AIReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [prefs, setPrefs] = useState<VCPreferences>(DEFAULT_PREFS);
  const [status, setStatus] = useState<SubmissionStatus>("Submitted");
  const [notes, setNotes] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [commentSent, setCommentSent] = useState(false);

  useEffect(() => {
    const found = MOCK_STARTUPS.find((s) => s.id === id);
    setStartup(found || null);

    const rawPrefs = localStorage.getItem("vc_prefs");
    if (rawPrefs) {
      const p = JSON.parse(rawPrefs);
      setPrefs(p);
      setStatus(p.dealStatuses?.[id] ?? "Submitted");
      setNotes(p.dealNotes?.[id] ?? "");
    }
  }, [id]);

  useEffect(() => {
    if (!startup) return;
    // Try to get cached report or generate one
    const cacheKey = `report_${id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setReport(JSON.parse(cached));
      return;
    }
    setLoadingReport(true);
    fetch("/api/ai-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboarding: startup.onboarding }),
    })
      .then((r) => r.json())
      .then((d) => {
        setReport(d.report);
        localStorage.setItem(cacheKey, JSON.stringify(d.report));
      })
      .finally(() => setLoadingReport(false));
  }, [startup, id]);

  const saveAction = async () => {
    setSaving(true);
    const newPrefs = {
      ...prefs,
      dealStatuses: { ...prefs.dealStatuses, [id]: status },
      dealNotes: { ...prefs.dealNotes, [id]: notes },
    };
    localStorage.setItem("vc_prefs", JSON.stringify(newPrefs));
    setPrefs(newPrefs);

    // Update submission if exists
    await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateStatus",
        submissionId: `sub-${id}`,
        status,
        notes,
        vcName: "Priya (VC Analyst)",
      }),
    });

    // Push notification
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "push",
        message: `Priya (VC Analyst) updated your deck status to "${status}"`,
        targetRole: "startup",
      }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sendComment = async () => {
    if (!comment.trim()) return;
    setSendingComment(true);
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "push",
        message: `VC Analyst left a comment: "${comment}"`,
        targetRole: "startup",
      }),
    });
    setSendingComment(false);
    setComment("");
    setCommentSent(true);
    setTimeout(() => setCommentSent(false), 2000);
  };

  if (!startup) return (
    <AppShell role="vc" onRoleSwitch={() => {}}>
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Startup not found.</div>
    </AppShell>
  );

  const o = startup.onboarding;

  return (
    <AppShell role="vc" onRoleSwitch={() => { localStorage.setItem("vc_role","startup"); router.push("/startup/onboarding"); }}>
      {/* Back */}
      <button className="btn-ghost" onClick={() => router.push("/vc/pipeline")} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13 }}>
        <ArrowLeft size={14} /> Back to Pipeline
      </button>

      {/* Split layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
        {/* LEFT — Report */}
        <div>
          {/* Company header */}
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 800, color: "#818cf8", flexShrink: 0,
              }}>
                {o.companyName[0]}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontWeight: 800, fontSize: 20, margin: "0 0 4px" }}>{o.companyName}</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: "0 0 10px" }}>{o.tagline}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[o.sector, o.fundingStage, o.geography, o.businessModel].map((tag) => (
                    <span key={tag} style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500 }}>{tag}</span>
                  ))}
                </div>
              </div>
              <FitScoreRing score={70} size={64} />
            </div>

            {/* Metrics row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--bg-border)" }}>
              {[
                { label: "ARR", val: o.arr },
                { label: "MRR", val: o.mrr },
                { label: "Growth", val: o.growthRate },
                { label: "Ask", val: o.askAmount },
              ].map(({ label, val }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 4px", textTransform: "uppercase" }}>{label}</p>
                  <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: label === "Ask" ? "#fbbf24" : label === "Growth" ? "#4ade80" : "var(--text-primary)" }}>{val || "—"}</p>
                </div>
              ))}
            </div>

            {/* Pitch deck mock */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={16} color="#818cf8" />
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>pitch_deck_{o.companyName.replace(/\s/g,"_").toLowerCase()}.pdf</span>
              </div>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="btn-secondary"
                style={{ fontSize: 12, padding: "5px 12px", display: "flex", alignItems: "center", gap: 5 }}
              >
                <Download size={12} /> Download
              </a>
            </div>
          </div>

          {/* AI Report */}
          {loadingReport ? (
            <div className="card shimmer" style={{ height: 300 }} />
          ) : report ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {report.sections.map((section) => (
                <div key={section.key} className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>REPORT</span>
                    {section.title}
                  </h3>
                  <div className="markdown-content">
                    <ReactMarkdown>{section.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* RIGHT — Action panel */}
        <div style={{ position: "sticky", top: 80 }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, margin: "0 0 20px" }}>Deal Actions</h3>

            {/* Status */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Deal Status</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    style={{
                      padding: "9px 14px",
                      borderRadius: 8,
                      border: status === s ? `1px solid ${STATUS_COLORS[s]}40` : "1px solid var(--bg-border)",
                      background: status === s ? `${STATUS_COLORS[s]}15` : "rgba(255,255,255,0.02)",
                      color: status === s ? STATUS_COLORS[s] : "var(--text-secondary)",
                      fontSize: 13, fontWeight: status === s ? 600 : 400,
                      cursor: "pointer", textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    {status === s ? "● " : "○ "}{s}
                  </button>
                ))}
              </div>
            </div>

            {/* Private notes */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Private Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-base"
                rows={4}
                placeholder="Internal notes — not shared with startup..."
                style={{ resize: "vertical", fontSize: 13 }}
              />
            </div>

            <button
              className="btn-primary"
              onClick={saveAction}
              disabled={saving}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}
            >
              <Save size={14} />
              {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Status & Notes"}
            </button>

            <hr className="divider" />

            {/* Share comment */}
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                <MessageSquare size={11} style={{ display: "inline", marginRight: 4 }} />
                Share Comment with Startup
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input-base"
                rows={3}
                placeholder="This message will be sent to the founder..."
                style={{ resize: "vertical", fontSize: 13, marginBottom: 10 }}
              />
              <button
                className="btn-secondary"
                onClick={sendComment}
                disabled={sendingComment || !comment.trim()}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13 }}
              >
                <MessageSquare size={13} />
                {commentSent ? "✓ Comment sent!" : sendingComment ? "Sending..." : "Send Comment"}
              </button>
            </div>

            {/* Founder quick info */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--bg-border)" }}>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Founder</p>
              <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 2px" }}>{o.founderName}</p>
              <p style={{ color: "var(--text-muted)", fontSize: 12, margin: "0 0 8px" }}>{o.founderRole}</p>
              <p style={{ color: "var(--text-secondary)", fontSize: 12, lineHeight: 1.5, margin: 0 }}>{o.founderBio.slice(0, 100)}...</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

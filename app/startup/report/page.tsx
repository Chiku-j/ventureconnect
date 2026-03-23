"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import AppShell from "@/components/layout/AppShell";
import { StartupOnboarding, EMPTY_ONBOARDING, AIReport, AIReportSection } from "@/lib/types";
import { RefreshCw, Edit3, CheckCircle, Download, Sparkles } from "lucide-react";

const SECTION_ICONS: Record<string, string> = {
  executive_summary: "📋",
  problem_solution: "🎯",
  market_opportunity: "🌍",
  business_model: "💡",
  competitive_landscape: "⚔️",
  team_advisors: "👥",
  traction_milestones: "📈",
  financial_projections: "💰",
  funding_ask: "🤝",
};

function AILoadingState() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const phases = [
    "Parsing company data...",
    "Analyzing market landscape...",
    "Evaluating team strength...",
    "Benchmarking competitors...",
    "Projecting financials...",
    "Generating investment thesis...",
    "Finalizing report...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 95));
      setPhase((ph) => (ph + 1) % phases.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", gap: 24 }}>
      {/* Orbital animation */}
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          border: "2px solid rgba(99,102,241,0.15)",
          position: "absolute",
        }} />
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          border: "2px solid transparent",
          borderTopColor: "#6366f1",
          position: "absolute",
          animation: "orbit 1.2s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Sparkles size={28} color="#6366f1" />
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, margin: "0 0 8px" }}>Gemini is analyzing your startup</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>{phases[phase]}</p>
      </div>

      {/* Progress bar */}
      <div style={{ width: 320 }}>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>{progress}% complete</p>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: 12 }}>Generating 9-section investment research report…</p>
    </div>
  );
}

export default function ReportPage() {
  const router = useRouter();
  const [onboarding, setOnboarding] = useState<StartupOnboarding>(EMPTY_ONBOARDING);
  const [report, setReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [regenerating, setRegenerating] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("startup_onboarding");
    if (raw) setOnboarding(JSON.parse(raw));
    const rawReport = localStorage.getItem("ai_report");
    if (rawReport) setReport(JSON.parse(rawReport));
  }, []);

  const generateReport = useCallback(async (o: StartupOnboarding) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding: o }),
      });
      const data = await res.json();
      setReport(data.report);
      localStorage.setItem("ai_report", JSON.stringify(data.report));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!report && onboarding.companyName) {
      generateReport(onboarding);
    }
  }, [onboarding, report, generateReport]);

  const regenerateSection = async (key: string) => {
    setRegenerating(key);
    try {
      const res = await fetch("/api/ai-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding, singleSection: key }),
      });
      const data = await res.json();
      const newSection = data.report.sections.find((s: AIReportSection) => s.key === key);
      if (newSection && report) {
        const updated = {
          ...report,
          sections: report.sections.map((s) => (s.key === key ? newSection : s)),
        };
        setReport(updated);
        localStorage.setItem("ai_report", JSON.stringify(updated));
      }
    } finally {
      setRegenerating(null);
    }
  };

  const saveEdit = (key: string) => {
    if (!report) return;
    const updated = {
      ...report,
      sections: report.sections.map((s) => (s.key === key ? { ...s, content: editContent } : s)),
    };
    setReport(updated);
    localStorage.setItem("ai_report", JSON.stringify(updated));
    setEditingKey(null);
  };

  return (
    <AppShell role="startup" onRoleSwitch={() => { localStorage.setItem("vc_role","vc"); router.push("/vc/onboarding"); }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em", margin: "0 0 4px" }}>
              Investment Research Report
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
              AI-generated · {onboarding.companyName || "Your Company"} · {new Date().toLocaleDateString()}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-secondary"
              onClick={() => generateReport(onboarding)}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <RefreshCw size={14} /> Regenerate All
            </button>
            <button
              className="btn-primary"
              onClick={() => router.push("/startup/matches")}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              View VC Matches →
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card">
            <AILoadingState />
          </div>
        ) : !report ? (
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)" }}>No report yet. Complete onboarding first.</p>
            <button className="btn-primary" onClick={() => router.push("/startup/onboarding")} style={{ marginTop: 16 }}>
              Go to Onboarding
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {report.sections.map((section, idx) => (
              <div
                key={section.key}
                className="card fade-slide-up"
                style={{ padding: 24, animationDelay: `${idx * 0.06}s` }}
              >
                {/* Section header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{SECTION_ICONS[section.key] || "📄"}</span>
                    <h3 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>{section.title}</h3>
                    <span style={{
                      background: "rgba(99,102,241,0.1)",
                      color: "#818cf8",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 10,
                      letterSpacing: "0.06em",
                    }}>
                      SECTION {idx + 1}/9
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="btn-ghost"
                      onClick={() => {
                        setEditingKey(section.key);
                        setEditContent(section.content);
                      }}
                      style={{ padding: "5px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={() => regenerateSection(section.key)}
                      disabled={regenerating === section.key}
                      style={{ padding: "5px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}
                    >
                      {regenerating === section.key ? (
                        <RefreshCw size={12} style={{ animation: "orbit 1s linear infinite" }} />
                      ) : (
                        <RefreshCw size={12} />
                      )}
                      Regen
                    </button>
                  </div>
                </div>

                {/* Content */}
                {editingKey === section.key ? (
                  <div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="input-base"
                      rows={12}
                      style={{ fontFamily: "monospace", fontSize: 13, resize: "vertical" }}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button className="btn-primary" onClick={() => saveEdit(section.key)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <CheckCircle size={14} /> Save
                      </button>
                      <button className="btn-secondary" onClick={() => setEditingKey(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[]}>{section.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}

            {/* CTA */}
            <div className="card" style={{ padding: 24, background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))", border: "1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 16, margin: "0 0 4px" }}>Report complete! Ready to find your VCs?</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>Get matched with VCs based on sector, stage, and ticket size.</p>
                </div>
                <button className="btn-primary" onClick={() => router.push("/startup/matches")} style={{ flexShrink: 0 }}>
                  View VC Matches →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

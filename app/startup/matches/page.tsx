"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import FitScoreRing from "@/components/ui/FitScoreRing";
import { StartupOnboarding, EMPTY_ONBOARDING, VCMatch, Submission } from "@/lib/types";
import { ExternalLink, Info, CheckCircle, X } from "lucide-react";

function SubmitModal({ match, onClose, onConfirm }: { match: VCMatch; onClose: () => void; onConfirm: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
      backdropFilter: "blur(4px)",
    }}>
      <div className="card fade-slide-up" style={{ width: 440, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Confirm Submission</h3>
          <button className="btn-ghost" onClick={onClose} style={{ padding: 4 }}><X size={18} /></button>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
          You are about to submit your pitch deck to <strong style={{ color: "var(--text-primary)" }}>{match.vc.name}</strong>.
          They will be notified and can review your AI report and pitch deck.
        </p>
        <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <FitScoreRing score={match.fitScore} size={56} />
            <div>
              <p style={{ fontWeight: 700, margin: "0 0 2px" }}>{match.vc.name}</p>
              <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0 }}>{match.vc.sectors.slice(0,3).join(" · ")} · {match.vc.stages.join(", ")}</p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn-primary" onClick={onConfirm} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <CheckCircle size={15} /> Submit Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const router = useRouter();
  const [onboarding, setOnboarding] = useState<StartupOnboarding>(EMPTY_ONBOARDING);
  const [matches, setMatches] = useState<VCMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<VCMatch | null>(null);
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("startup_onboarding");
    const rawSubs = localStorage.getItem("submitted_vcs");
    if (raw) setOnboarding(JSON.parse(raw));
    if (rawSubs) setSubmitted(new Set(JSON.parse(rawSubs)));
  }, []);

  useEffect(() => {
    if (!onboarding.companyName) return;
    setLoading(true);
    fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "startup", onboarding }),
    })
      .then((r) => r.json())
      .then((d) => setMatches(d.matches || []))
      .finally(() => setLoading(false));
  }, [onboarding]);

  const confirmSubmit = async () => {
    if (!submitting) return;
    const startupId = "my-startup";
    await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submit",
        startupId,
        vcId: submitting.vc.id,
        vcName: submitting.vc.name,
      }),
    });
    const next = new Set(submitted);
    next.add(submitting.vc.id);
    setSubmitted(next);
    localStorage.setItem("submitted_vcs", JSON.stringify([...next]));
    setSubmitting(null);
    showToast(`✅ Submitted to ${submitting.vc.name}!`);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AppShell role="startup" onRoleSwitch={() => { localStorage.setItem("vc_role","vc"); router.push("/vc/onboarding"); }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em", margin: "0 0 4px" }}>VC Matches</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
              {matches.length} VCs ranked by fit score for {onboarding.companyName || "your startup"}
            </p>
          </div>
          <button className="btn-secondary" onClick={() => router.push("/startup/submissions")}>
            My Submissions →
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card shimmer" style={{ height: 220 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {matches.map((match, idx) => (
              <div
                key={match.vc.id}
                className="card fade-slide-up"
                style={{ padding: 20, animationDelay: `${idx * 0.05}s` }}
              >
                {/* VC header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 800, color: "#818cf8",
                    flexShrink: 0,
                  }}>
                    {match.vc.logo}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {match.vc.name}
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0 }}>{match.vc.aum} AUM</p>
                  </div>
                  {/* Score ring with tooltip */}
                  <div className="tooltip-container">
                    <FitScoreRing score={match.fitScore} size={56} />
                    <div className="tooltip-box">
                      <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 8px" }}>Match Breakdown</p>
                      {[
                        { label: "Sector", val: match.breakdown.sector, weight: "35%" },
                        { label: "Stage", val: match.breakdown.stage, weight: "25%" },
                        { label: "Ticket Size", val: match.breakdown.ticketSize, weight: "20%" },
                        { label: "Geography", val: match.breakdown.geography, weight: "10%" },
                        { label: "Biz Model", val: match.breakdown.businessModel, weight: "10%" },
                      ].map(({ label, val, weight }) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label} <span style={{ color: "var(--text-muted)", fontSize: 10 }}>({weight})</span></span>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ width: `${val}%`, height: "100%", background: val >= 70 ? "#22c55e" : val >= 40 ? "#f59e0b" : "#ef4444", borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: val >= 70 ? "#4ade80" : val >= 40 ? "#fbbf24" : "#f87171", minWidth: 28 }}>{val}</span>
                          </div>
                        </div>
                      ))}
                      <hr style={{ border: "none", borderTop: "1px solid #2a2a38", margin: "10px 0 8px" }} />
                      {match.matchReasons.slice(0, 3).map((r, i) => (
                        <p key={i} style={{ fontSize: 11, margin: "2px 0", color: "var(--text-secondary)" }}>{r}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                  {match.vc.stages.map((s) => (
                    <span key={s} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "var(--text-secondary)" }}>{s}</span>
                  ))}
                  <span style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "#818cf8" }}>
                    ${match.vc.ticketMin}M–${match.vc.ticketMax}M
                  </span>
                </div>

                <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.5, margin: "0 0 16px" }}>
                  {match.vc.sectors.slice(0, 3).join(" · ")}
                </p>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className={submitted.has(match.vc.id) ? "btn-secondary" : "btn-primary"}
                    onClick={() => !submitted.has(match.vc.id) && setSubmitting(match)}
                    disabled={submitted.has(match.vc.id)}
                    style={{ flex: 1, fontSize: 12, padding: "7px 0" }}
                  >
                    {submitted.has(match.vc.id) ? "✓ Submitted" : "Submit Deck"}
                  </button>
                  <a
                    href={match.vc.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost"
                    style={{ padding: "7px 10px" }}
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit modal */}
      {submitting && (
        <SubmitModal match={submitting} onClose={() => setSubmitting(null)} onConfirm={confirmSubmit} />
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed", bottom: 24, right: 24,
            background: "#18181f", border: "1px solid #22c55e",
            borderRadius: 10, padding: "12px 20px",
            color: "#4ade80", fontSize: 14, fontWeight: 600,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            zIndex: 300,
          }}
          className="fade-slide-up"
        >
          {toast}
        </div>
      )}
    </AppShell>
  );
}

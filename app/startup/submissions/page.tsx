"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { Submission } from "@/lib/types";

const STATUS_META: Record<string, { label: string; class: string; emoji: string }> = {
  "Submitted":    { label: "Submitted",    class: "badge-submitted", emoji: "📤" },
  "Under Review": { label: "Under Review", class: "badge-review",    emoji: "🔍" },
  "Interested":   { label: "Interested",   class: "badge-interested",emoji: "✅" },
  "Passed":       { label: "Passed",       class: "badge-passed",    emoji: "❌" },
};

export default function SubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/submissions?startupId=my-startup")
      .then((r) => r.json())
      .then((d) => setSubmissions(d.submissions || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell role="startup" onRoleSwitch={() => { localStorage.setItem("vc_role","vc"); router.push("/vc/onboarding"); }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em", margin: "0 0 4px" }}>My Submissions</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
            Track the status of your pitch deck submissions
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total", count: submissions.length, color: "#818cf8" },
            { label: "Under Review", count: submissions.filter(s=>s.status==="Under Review").length, color: "#fbbf24" },
            { label: "Interested", count: submissions.filter(s=>s.status==="Interested").length, color: "#4ade80" },
            { label: "Passed", count: submissions.filter(s=>s.status==="Passed").length, color: "#f87171" },
          ].map(({ label, count, color }) => (
            <div key={label} className="card" style={{ padding: 16, textAlign: "center" }}>
              <p style={{ fontSize: 28, fontWeight: 800, margin: 0, color }}>{count}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(3)].map((_, i) => <div key={i} className="card shimmer" style={{ height: 80 }} />)}
          </div>
        ) : submissions.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: "center" }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>📭</p>
            <h3 style={{ fontWeight: 700, margin: "0 0 8px" }}>No submissions yet</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 20px" }}>
              Browse your VC matches and submit your deck to get started.
            </p>
            <button className="btn-primary" onClick={() => router.push("/startup/matches")}>
              Browse VC Matches →
            </button>
          </div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                  {["VC Firm", "Submitted", "Last Update", "Status", "Comment"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const meta = STATUS_META[sub.status] ?? STATUS_META["Submitted"];
                  return (
                    <tr key={sub.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{sub.vcName}</p>
                        <p style={{ color: "var(--text-muted)", fontSize: 11, margin: "2px 0 0" }}>Submission ID: {sub.id}</p>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--text-secondary)", fontSize: 13 }}>
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--text-secondary)", fontSize: 13 }}>
                        {new Date(sub.updatedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span className={`badge ${meta.class}`}>{meta.emoji} {meta.label}</span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 12, fontStyle: sub.vcComment ? "normal" : "italic" }}>
                        {sub.vcComment || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}

"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import FitScoreRing from "@/components/ui/FitScoreRing";
import { VCPreferences, StartupMatch } from "@/lib/types";
import { LayoutGrid, List, SlidersHorizontal, Star } from "lucide-react";
import { getScoreBadgeClass } from "@/lib/matching";

const DEFAULT_PREFS: VCPreferences = {
  vcId: "priya-vc", sectors: ["Fintech","SaaS"], stages: ["Seed","Series A"],
  ticketMin: 1, ticketMax: 10, geographies: ["India","Southeast Asia"],
  businessModels: ["B2B SaaS","Marketplace"], watchlist: [], dealNotes: {}, dealStatuses: {},
};

export default function PipelinePage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<VCPreferences>(DEFAULT_PREFS);
  const [matches, setMatches] = useState<StartupMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"card" | "table">("card");
  const [minScore, setMinScore] = useState(0);
  const [filterSector, setFilterSector] = useState("All");
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    const raw = localStorage.getItem("vc_prefs");
    const rawWl = localStorage.getItem("vc_watchlist");
    if (raw) setPrefs(JSON.parse(raw));
    if (rawWl) setWatchlist(new Set(JSON.parse(rawWl)));
  }, []);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "vc", prefs }),
    });
    const data = await res.json();
    setMatches(data.matches || []);
    setLoading(false);
  }, [prefs]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const toggleWatchlist = (id: string) => {
    const next = new Set(watchlist);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setWatchlist(next);
    localStorage.setItem("vc_watchlist", JSON.stringify([...next]));
  };

  const sectors = ["All", ...new Set(matches.map((m) => m.startup.onboarding.sector))];
  const filtered = matches.filter((m) =>
    m.fitScore >= minScore &&
    (filterSector === "All" || m.startup.onboarding.sector === filterSector)
  );

  return (
    <AppShell role="vc" onRoleSwitch={() => { localStorage.setItem("vc_role","startup"); router.push("/startup/onboarding"); }}>
      <div>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em", margin: "0 0 4px" }}>Deal Pipeline</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
              {filtered.length} startups matched to your thesis
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {/* View toggle */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid var(--bg-border)", borderRadius: 8, overflow: "hidden" }}>
              {(["card","table"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: "7px 14px", border: "none", cursor: "pointer",
                  background: view === v ? "rgba(99,102,241,0.2)" : "transparent",
                  color: view === v ? "#818cf8" : "var(--text-muted)",
                  fontSize: 13, display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.15s",
                }}>
                  {v === "card" ? <LayoutGrid size={14} /> : <List size={14} />}
                  {v === "card" ? "Cards" : "Table"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13 }}>
            <SlidersHorizontal size={14} /> Filters:
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Min Score:</label>
            <input type="range" min={0} max={100} value={minScore} onChange={(e) => setMinScore(parseInt(e.target.value, 10))} style={{ width: 100, accentColor: "#6366f1" }} />
            <span style={{ fontSize: 12, color: "#818cf8", fontWeight: 600, minWidth: 28 }}>{minScore}+</span>
          </div>
          <select
            className="input-base"
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            style={{ width: "auto", padding: "6px 12px", fontSize: 12 }}
          >
            {sectors.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Card view */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 16 }}>
            {[...Array(5)].map((_, i) => <div key={i} className="card shimmer" style={{ height: 200 }} />)}
          </div>
        ) : view === "card" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 16 }}>
            {filtered.map((match, idx) => {
              const o = match.startup.onboarding;
              return (
                <div
                  key={match.startup.id}
                  className="card fade-slide-up"
                  style={{ padding: 20, cursor: "pointer", animationDelay: `${idx * 0.05}s` }}
                  onClick={() => router.push(`/vc/pipeline/${match.startup.id}`)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 2px" }}>{o.companyName}</p>
                      <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0 }}>{o.tagline}</p>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWatchlist(match.startup.id); }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                      >
                        <Star size={15} fill={watchlist.has(match.startup.id) ? "#f59e0b" : "none"} color={watchlist.has(match.startup.id) ? "#f59e0b" : "var(--text-muted)"} />
                      </button>
                      <FitScoreRing score={match.fitScore} size={52} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                    <span style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{o.sector}</span>
                    <span style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: 6, fontSize: 11 }}>{o.fundingStage}</span>
                    <span style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: 6, fontSize: 11 }}>{o.geography}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {[
                      { label: "ARR", val: o.arr || "—" },
                      { label: "Growth", val: o.growthRate || "—" },
                      { label: "Ask", val: o.askAmount || "—" },
                    ].map(({ label, val }) => (
                      <div key={label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px" }}>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 2px", textTransform: "uppercase" }}>{label}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table view */
          <div className="card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                  {["Score","Company","Sector","Stage","ARR","Growth","Ask",""].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((match) => {
                  const o = match.startup.onboarding;
                  const bc = getScoreBadgeClass(match.fitScore);
                  return (
                    <tr
                      key={match.startup.id}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 0.1s" }}
                      onClick={() => router.push(`/vc/pipeline/${match.startup.id}`)}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <span className={`badge ring-1 ${bc}`} style={{ fontWeight: 700, fontSize: 13 }}>{match.fitScore}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{o.companyName}</p>
                        <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0 }}>{o.founderName}</p>
                      </td>
                      <td style={{ padding: "12px 14px", color: "#818cf8", fontSize: 13 }}>{o.sector}</td>
                      <td style={{ padding: "12px 14px", color: "var(--text-secondary)", fontSize: 13 }}>{o.fundingStage}</td>
                      <td style={{ padding: "12px 14px", color: "var(--text-primary)", fontSize: 13, fontWeight: 500 }}>{o.arr || "—"}</td>
                      <td style={{ padding: "12px 14px", color: "#4ade80", fontSize: 13 }}>{o.growthRate || "—"}</td>
                      <td style={{ padding: "12px 14px", color: "#fbbf24", fontSize: 13, fontWeight: 600 }}>{o.askAmount || "—"}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWatchlist(match.startup.id); }}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                        >
                          <Star size={14} fill={watchlist.has(match.startup.id) ? "#f59e0b" : "none"} color={watchlist.has(match.startup.id) ? "#f59e0b" : "var(--text-muted)"} />
                        </button>
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

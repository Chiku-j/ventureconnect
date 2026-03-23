"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import FitScoreRing from "@/components/ui/FitScoreRing";
import { MOCK_STARTUPS } from "@/lib/mockStartups";
import { StartupProfile } from "@/lib/types";
import { Star, ArrowRight } from "lucide-react";

export default function WatchlistPage() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [startups, setStartups] = useState<StartupProfile[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("vc_watchlist");
    if (raw) {
      const ids = JSON.parse(raw) as string[];
      setWatchlist(new Set(ids));
      setStartups(MOCK_STARTUPS.filter((s) => ids.includes(s.id)));
    }
  }, []);

  const removeFromWatchlist = (id: string) => {
    const next = new Set(watchlist);
    next.delete(id);
    setWatchlist(next);
    localStorage.setItem("vc_watchlist", JSON.stringify([...next]));
    setStartups((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <AppShell role="vc" onRoleSwitch={() => { localStorage.setItem("vc_role","startup"); router.push("/startup/onboarding"); }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em", margin: "0 0 4px" }}>Watchlist</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
            {startups.length} starred {startups.length === 1 ? "startup" : "startups"}
          </p>
        </div>

        {startups.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: "center" }}>
            <Star size={40} color="var(--text-muted)" style={{ margin: "0 auto 16px", display: "block" }} />
            <h3 style={{ fontWeight: 700, margin: "0 0 8px" }}>Your watchlist is empty</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 20px" }}>
              Star startups in the pipeline to add them here.
            </p>
            <button className="btn-primary" onClick={() => router.push("/vc/pipeline")}>
              Browse Pipeline →
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {startups.map((startup, idx) => {
              const o = startup.onboarding;
              return (
                <div
                  key={startup.id}
                  className="card fade-slide-up"
                  style={{ padding: 20, display: "flex", alignItems: "center", gap: 16, animationDelay: `${idx * 0.05}s` }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 800, color: "#818cf8",
                  }}>
                    {o.companyName[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 2px" }}>{o.companyName}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0 }}>{o.sector} · {o.fundingStage} · {o.askAmount}</p>
                  </div>
                  <FitScoreRing score={75} size={48} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn-primary"
                      onClick={() => router.push(`/vc/pipeline/${startup.id}`)}
                      style={{ fontSize: 12, padding: "6px 14px", display: "flex", alignItems: "center", gap: 5 }}
                    >
                      Review <ArrowRight size={12} />
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={() => removeFromWatchlist(startup.id)}
                      style={{ padding: "6px 10px" }}
                    >
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

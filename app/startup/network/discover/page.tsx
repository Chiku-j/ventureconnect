"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { NetworkProfile } from "@/lib/types";
import { UserCheck, MessageSquare, SlidersHorizontal } from "lucide-react";

export default function DiscoverPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<NetworkProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState("All");
  const [stage, setStage] = useState("All");
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [connecting, setConnecting] = useState<string | null>(null);

  const myId = "founder-me";

  const load = useCallback(async () => {
    const params = new URLSearchParams({ action: "discover" });
    if (sector !== "All") params.set("sector", sector);
    if (stage !== "All") params.set("stage", stage);
    const res = await fetch(`/api/network?${params}`);
    const data = await res.json();
    setProfiles(data.profiles ?? []);
    setLoading(false);
  }, [sector, stage]);

  useEffect(() => { load(); }, [load]);

  const connect = async (toId: string) => {
    setConnecting(toId);
    await fetch("/api/network", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "connect", fromId: myId, toId }),
    });
    setConnected(prev => new Set([...prev, toId]));
    setConnecting(null);
  };

  const sectors = ["All","Fintech","SaaS","HealthTech","EdTech","DeepTech","CleanTech","AI/ML","Cybersecurity","Web3","E-commerce"];
  const stages = ["All","Pre-Seed","Seed","Series A","Series B","Series C+"];

  return (
    <AppShell role="startup" onRoleSwitch={() => router.push("/vc/onboarding")}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em", margin: "0 0 4px" }}>Find Founders</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
              Connect with peers building at the same stage
            </p>
          </div>
          <button className="btn-secondary" onClick={() => router.push("/startup/network")} style={{ fontSize: 13 }}>
            ← Back to Feed
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
          <SlidersHorizontal size={14} color="var(--text-muted)" />
          <select className="input-base" value={sector} onChange={e => setSector(e.target.value)} style={{ width: "auto", padding: "7px 12px", fontSize: 13 }}>
            {sectors.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="input-base" value={stage} onChange={e => setStage(e.target.value)} style={{ width: "auto", padding: "7px 12px", fontSize: 13 }}>
            {stages.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="card shimmer" style={{ height: 200 }} />)}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {profiles.map((p, idx) => {
              const isConnected = connected.has(p.id) || p.connections.includes(myId);
              return (
                <div key={p.id} className="card fade-slide-up" style={{ padding: 20, animationDelay: `${idx * 0.05}s` }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                      background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, fontWeight: 800, color: "#818cf8",
                    }}>
                      {p.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 2px" }}>{p.name}</p>
                      <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0 }}>{p.role} · {p.companyName}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                    {[p.sector, p.stage, p.geography].map(tag => (
                      <span key={tag} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 5, padding: "2px 7px", fontSize: 10, color: "var(--text-secondary)" }}>{tag}</span>
                    ))}
                  </div>

                  {p.expertiseTags.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                      {p.expertiseTags.map(t => (
                        <span key={t} style={{ background: "rgba(99,102,241,0.08)", color: "#818cf8", borderRadius: 5, padding: "2px 7px", fontSize: 10 }}>{t}</span>
                      ))}
                    </div>
                  )}

                  {p.needRightNow && (
                    <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8, padding: "8px 10px", marginBottom: 12 }}>
                      <p style={{ fontSize: 10, color: "#fbbf24", margin: "0 0 2px", fontWeight: 700 }}>NEEDS RIGHT NOW</p>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>{p.needRightNow}</p>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className={isConnected ? "btn-secondary" : "btn-primary"}
                      onClick={() => !isConnected && connect(p.id)}
                      disabled={!!connecting || isConnected}
                      style={{ flex: 1, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                    >
                      <UserCheck size={13} />
                      {connecting === p.id ? "Connecting..." : isConnected ? "Connected" : "Connect"}
                    </button>
                    {isConnected && (
                      <button
                        className="btn-ghost"
                        onClick={() => router.push(`/startup/network/messages?with=${p.id}`)}
                        style={{ padding: "7px 12px" }}
                      >
                        <MessageSquare size={14} />
                      </button>
                    )}
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

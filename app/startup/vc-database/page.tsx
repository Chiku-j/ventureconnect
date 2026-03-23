"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { MOCK_VCS } from "@/lib/mockVCs";
import { VCFirm } from "@/lib/types";
import { Search, Plus, Check, ExternalLink, SlidersHorizontal } from "lucide-react";

export default function VCDatabasePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filterSector, setFilterSector] = useState("All");
  const [filterStage, setFilterStage] = useState("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const sectors = ["All", ...new Set(MOCK_VCS.flatMap(v => v.sectors))];
  const stages = ["All", ...new Set(MOCK_VCS.flatMap(v => v.stages))];

  const filtered = MOCK_VCS.filter(vc => {
    const q = query.toLowerCase();
    const matchQ = !q || vc.name.toLowerCase().includes(q) || vc.tagline.toLowerCase().includes(q) || vc.sectors.some(s => s.toLowerCase().includes(q));
    const matchS = filterSector === "All" || vc.sectors.includes(filterSector as any);
    const matchSt = filterStage === "All" || vc.stages.includes(filterStage as any);
    return matchQ && matchS && matchSt;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const addToSequence = async () => {
    if (selected.size === 0) return;
    setAdding(true);
    const vcs = [...selected].map(id => {
      const vc = MOCK_VCS.find(v => v.id === id)!;
      return { vcId: vc.id, vcName: vc.name };
    });
    await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addBulk", vcs }),
    });
    setAdding(false);
    setToast(`✅ Added ${selected.size} VC${selected.size > 1 ? "s" : ""} to your CRM!`);
    setSelected(new Set());
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AppShell role="startup" onRoleSwitch={() => router.push("/vc/onboarding")}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em", margin: "0 0 4px" }}>VC Database</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
              All {MOCK_VCS.length} VC firms — search and filter regardless of match score
            </p>
          </div>
          {selected.size > 0 && (
            <button
              className="btn-primary fade-slide-up"
              onClick={addToSequence}
              disabled={adding}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={15} /> Add {selected.size} to CRM Sequence
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="input-base"
              placeholder="Search by name, sector, tagline..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
          <select className="input-base" value={filterSector} onChange={e => setFilterSector(e.target.value)} style={{ width: "auto", padding: "8px 12px", fontSize: 13 }}>
            {sectors.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="input-base" value={filterStage} onChange={e => setFilterStage(e.target.value)} style={{ width: "auto", padding: "8px 12px", fontSize: 13 }}>
            {stages.map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="btn-secondary" onClick={() => router.push("/startup/crm")} style={{ fontSize: 13 }}>
            View CRM →
          </button>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {filtered.map((vc, idx) => {
            const isSelected = selected.has(vc.id);
            return (
              <div
                key={vc.id}
                className="card fade-slide-up"
                style={{
                  padding: 20,
                  cursor: "pointer",
                  animationDelay: `${idx * 0.04}s`,
                  border: isSelected ? "1px solid rgba(99,102,241,0.5)" : "1px solid var(--bg-border)",
                  background: isSelected ? "rgba(99,102,241,0.06)" : undefined,
                  transition: "border 0.15s, background 0.15s",
                }}
                onClick={() => toggleSelect(vc.id)}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 800, color: "#818cf8",
                  }}>
                    {vc.logo}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 2px" }}>{vc.name}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0 }}>{vc.aum} AUM · {vc.portfolioCount} portfolio co.</p>
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, border: isSelected ? "none" : "1px solid rgba(255,255,255,0.12)",
                    background: isSelected ? "#6366f1" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {isSelected && <Check size={13} color="white" />}
                  </div>
                </div>

                <p style={{ color: "var(--text-secondary)", fontSize: 12, lineHeight: 1.5, margin: "0 0 12px" }}>{vc.tagline}</p>

                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {vc.sectors.slice(0, 3).map(s => (
                    <span key={s} style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", padding: "2px 7px", borderRadius: 5, fontSize: 10, fontWeight: 600 }}>{s}</span>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                    ${vc.ticketMin}M–${vc.ticketMax}M · {vc.stages.join(", ")}
                  </span>
                  <a href={vc.website} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ color: "var(--text-muted)", display: "flex" }}
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="card" style={{ padding: 48, textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No VCs found matching your filters.</p>
          </div>
        )}
      </div>

      {toast && (
        <div className="fade-slide-up" style={{
          position: "fixed", bottom: 24, right: 24,
          background: "#18181f", border: "1px solid #22c55e",
          borderRadius: 10, padding: "12px 20px",
          color: "#4ade80", fontSize: 14, fontWeight: 600,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 300,
        }}>
          {toast}
        </div>
      )}
    </AppShell>
  );
}

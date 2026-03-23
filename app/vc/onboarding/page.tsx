"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { Sector, FundingStage, BusinessModel, Geography, VCPreferences } from "@/lib/types";
import { ChevronRight } from "lucide-react";

const SECTORS: Sector[] = ["Fintech","SaaS","HealthTech","EdTech","DeepTech","CleanTech","E-commerce","AI/ML","Cybersecurity","Web3"];
const STAGES: FundingStage[] = ["Pre-Seed","Seed","Series A","Series B","Series C+"];
const BIZMODELS: BusinessModel[] = ["B2B SaaS","B2C","Marketplace","D2C","Enterprise","API/Platform","Hardware","Consulting"];
const GEOS: Geography[] = ["India","Southeast Asia","USA","Europe","Middle East","Global","Africa","LATAM"];

function MultiSelect<T extends string>({ options, selected, onToggle, label }: { options: T[]; selected: T[]; onToggle: (o: T) => void; label: string }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onToggle(o)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              border: selected.includes(o) ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.1)",
              background: selected.includes(o) ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
              color: selected.includes(o) ? "#818cf8" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

const DEFAULT_PREFS: VCPreferences = {
  vcId: "priya-vc",
  sectors: ["Fintech", "SaaS"],
  stages: ["Seed", "Series A"],
  ticketMin: 1,
  ticketMax: 10,
  geographies: ["India", "Southeast Asia"],
  businessModels: ["B2B SaaS", "Marketplace"],
  watchlist: [],
  dealNotes: {},
  dealStatuses: {},
};

export default function VCOnboardingPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<VCPreferences>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("vc_prefs");
    if (raw) setPrefs(JSON.parse(raw));
  }, []);

  const save = (p: VCPreferences) => {
    setPrefs(p);
    localStorage.setItem("vc_prefs", JSON.stringify(p));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const toggle = <T extends string>(key: keyof VCPreferences, val: T) => {
    const arr = prefs[key] as T[];
    const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
    save({ ...prefs, [key]: next });
  };

  return (
    <AppShell role="vc" onRoleSwitch={() => { localStorage.setItem("vc_role","startup"); router.push("/startup/onboarding"); }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em", margin: "0 0 4px" }}>
            Investment Thesis
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
            Hi Priya 👋 — set your preferences to get matched with the best startups
          </p>
        </div>

        <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 28 }}>
          <MultiSelect options={SECTORS} selected={prefs.sectors} onToggle={(o) => toggle("sectors", o)} label="Sectors you invest in" />
          <hr className="divider" />
          <MultiSelect options={STAGES} selected={prefs.stages} onToggle={(o) => toggle("stages", o)} label="Funding stages" />
          <hr className="divider" />

          {/* Ticket range */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              Ticket Size Range: <strong style={{ color: "var(--text-primary)" }}>${prefs.ticketMin}M – ${prefs.ticketMax}M</strong>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Min ($M)</label>
                <input
                  type="range" min={0.1} max={50} step={0.5}
                  value={prefs.ticketMin}
                  onChange={(e) => save({ ...prefs, ticketMin: parseFloat(e.target.value) })}
                  style={{ width: "100%", accentColor: "#6366f1" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Max ($M)</label>
                <input
                  type="range" min={0.5} max={100} step={1}
                  value={prefs.ticketMax}
                  onChange={(e) => save({ ...prefs, ticketMax: parseFloat(e.target.value) })}
                  style={{ width: "100%", accentColor: "#6366f1" }}
                />
              </div>
            </div>
          </div>

          <hr className="divider" />
          <MultiSelect options={GEOS} selected={prefs.geographies} onToggle={(o) => toggle("geographies", o)} label="Geographies" />
          <hr className="divider" />
          <MultiSelect options={BIZMODELS} selected={prefs.businessModels} onToggle={(o) => toggle("businessModels", o)} label="Business models" />

          <div style={{ paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {saved && <span style={{ fontSize: 12, color: "#22c55e" }}>✓ Preferences saved</span>}
            <button
              className="btn-primary"
              onClick={() => router.push("/vc/pipeline")}
              style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}
            >
              View Pipeline <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { StartupOnboarding, EMPTY_ONBOARDING, Sector, FundingStage, BusinessModel, Geography } from "@/lib/types";
import { ChevronRight, ChevronLeft, Save, Upload } from "lucide-react";

const STEPS = [
  { id: 1, title: "Company Basics",    emoji: "🏢" },
  { id: 2, title: "Team",              emoji: "👥" },
  { id: 3, title: "Business Model",    emoji: "💡" },
  { id: 4, title: "Problem & Solution",emoji: "🎯" },
  { id: 5, title: "Traction",          emoji: "📈" },
  { id: 6, title: "Funding",           emoji: "💰" },
];

const SECTORS: Sector[] = ["Fintech","SaaS","HealthTech","EdTech","DeepTech","CleanTech","E-commerce","AI/ML","Cybersecurity","Web3"];
const STAGES: FundingStage[] = ["Pre-Seed","Seed","Series A","Series B","Series C+"];
const BIZMODELS: BusinessModel[] = ["B2B SaaS","B2C","Marketplace","D2C","Enterprise","API/Platform","Hardware","Consulting"];
const GEOS: Geography[] = ["India","Southeast Asia","USA","Europe","Middle East","Global","Africa","LATAM"];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default function StartupOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<StartupOnboarding>(EMPTY_ONBOARDING);
  const [saved, setSaved] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("startup_onboarding");
    if (saved) setData(JSON.parse(saved));
    const savedStep = localStorage.getItem("startup_onboarding_step");
    if (savedStep) setStep(parseInt(savedStep, 10));
  }, []);

  const save = (d: StartupOnboarding, s: number) => {
    localStorage.setItem("startup_onboarding", JSON.stringify(d));
    localStorage.setItem("startup_onboarding_step", String(s));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const set = (key: keyof StartupOnboarding, value: any) => {
    const next = { ...data, [key]: value };
    setData(next);
    save(next, step);
  };

  const goNext = () => {
    const nextStep = Math.min(step + 1, 6);
    save(data, nextStep);
    setStep(nextStep);
    if (step === 6) router.push("/startup/report");
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const inp = (key: keyof StartupOnboarding) => ({
    className: "input-base",
    value: (data[key] as string) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(key, e.target.value),
  });

  return (
    <AppShell role="startup" onRoleSwitch={() => { localStorage.setItem("vc_role","vc"); router.push("/vc/onboarding"); }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em", margin: "0 0 4px" }}>
            Company Onboarding
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
            Step {step} of 6 — {STEPS[step - 1].title} {STEPS[step - 1].emoji}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            {STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "none",
                  background: s.id === step
                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                    : s.id < step
                    ? "#22c55e"
                    : "rgba(255,255,255,0.06)",
                  color: s.id <= step ? "white" : "var(--text-muted)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: s.id === step ? "0 0 16px rgba(99,102,241,0.5)" : "none",
                }}
              >
                {s.id < step ? "✓" : s.id}
              </button>
            ))}
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${((step - 1) / 5) * 100}%` }} />
          </div>
        </div>

        {/* Auto-save indicator */}
        <div style={{ marginBottom: 16, height: 20, display: "flex", alignItems: "center", gap: 6 }}>
          {saved && (
            <span style={{ fontSize: 12, color: "#22c55e", display: "flex", alignItems: "center", gap: 5 }}>
              <Save size={12} /> Auto-saved
            </span>
          )}
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: 28 }}>
          {/* Step 1 */}
          {step === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Field label="Company Name" required>
                <input {...inp("companyName")} placeholder="e.g. FinFlow AI" />
              </Field>
              <Field label="Founded Year">
                <input {...inp("founded")} placeholder="2024" />
              </Field>
              <Field label="Tagline" required>
                <input {...inp("tagline")} placeholder="One-line description" style={{ gridColumn: "1/-1" } as any} />
              </Field>
              <Field label="Website">
                <input {...inp("website")} placeholder="https://example.com" />
              </Field>
              <Field label="Sector" required>
                <select className="input-base" value={data.sector} onChange={(e) => set("sector", e.target.value)}>
                  {SECTORS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Geography" required>
                <select className="input-base" value={data.geography} onChange={(e) => set("geography", e.target.value)}>
                  {GEOS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </Field>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Field label="Founder Name" required>
                <input {...inp("founderName")} placeholder="e.g. Arjun Mehta" />
              </Field>
              <Field label="Founder Role" required>
                <input {...inp("founderRole")} placeholder="e.g. CEO & Co-Founder" />
              </Field>
              <div style={{ gridColumn: "1/-1" }}>
                <Field label="Founder Bio">
                  <textarea {...inp("founderBio")} rows={3} placeholder="Background, previous role, education..." style={{ resize: "vertical" }} />
                </Field>
              </div>
              <Field label="Team Size">
                <input
                  className="input-base"
                  type="number"
                  min={1}
                  value={data.teamSize}
                  onChange={(e) => set("teamSize", parseInt(e.target.value, 10))}
                />
              </Field>
              <div style={{ gridColumn: "1/-1" }}>
                <Field label="Key Team Members">
                  <input {...inp("keyMembers")} placeholder="e.g. Jane (CTO, ex-Google), Bob (COO, ex-McKinsey)" />
                </Field>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <Field label="Advisors">
                  <input {...inp("advisors")} placeholder="Notable advisors / investors" />
                </Field>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Field label="Business Model" required>
                <select className="input-base" value={data.businessModel} onChange={(e) => set("businessModel", e.target.value)}>
                  {BIZMODELS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Target Customer" required>
                <input {...inp("targetCustomer")} placeholder="e.g. SMEs with 5–50 finance team members" />
              </Field>
              <div style={{ gridColumn: "1/-1" }}>
                <Field label="Revenue Model">
                  <textarea {...inp("revenueModel")} rows={2} placeholder="How do you make money?" style={{ resize: "vertical" }} />
                </Field>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <Field label="Pricing Strategy">
                  <input {...inp("pricingStrategy")} placeholder="e.g. ₹5,000/seat/month, enterprise custom" />
                </Field>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
              <Field label="Problem Statement" required>
                <textarea {...inp("problem")} rows={3} placeholder="What painful problem are you solving?" style={{ resize: "vertical" }} />
              </Field>
              <Field label="Your Solution" required>
                <textarea {...inp("solution")} rows={3} placeholder="How does your product solve it?" style={{ resize: "vertical" }} />
              </Field>
              <Field label="Unique Value Proposition">
                <input {...inp("uniqueValueProp")} placeholder="What makes you differentiated?" />
              </Field>
              <Field label="Competitive Advantage">
                <input {...inp("competitiveAdvantage")} placeholder="What's your moat?" />
              </Field>
            </div>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Field label="MRR">
                <input {...inp("mrr")} placeholder="e.g. $42,000" />
              </Field>
              <Field label="ARR">
                <input {...inp("arr")} placeholder="e.g. $504,000" />
              </Field>
              <Field label="Customers">
                <input {...inp("customers")} placeholder="e.g. 87 paying customers" />
              </Field>
              <Field label="Growth Rate (MoM)">
                <input {...inp("growthRate")} placeholder="e.g. 22% MoM" />
              </Field>
              <div style={{ gridColumn: "1/-1" }}>
                <Field label="Key Metrics">
                  <input {...inp("keyMetrics")} placeholder="NPS, churn, CAC, LTV…" />
                </Field>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <Field label="Key Partnerships">
                  <input {...inp("partnerships")} placeholder="Notable partnerships or pilots" />
                </Field>
              </div>
              {/* Simulated pitch deck upload */}
              <div style={{ gridColumn: "1/-1" }}>
                <Field label="Pitch Deck (PDF/PPT)">
                  <div
                    style={{
                      border: "2px dashed rgba(99,102,241,0.3)",
                      borderRadius: 10,
                      padding: "24px",
                      textAlign: "center",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      fontSize: 13,
                    }}
                  >
                    <Upload size={20} style={{ margin: "0 auto 8px", display: "block", color: "#6366f1" }} />
                    <span>Drag & drop your pitch deck or <span style={{ color: "#818cf8", textDecoration: "underline" }}>browse</span></span>
                    <br /><span style={{ fontSize: 11 }}>PDF, PPT, PPTX — max 20MB (simulated upload)</span>
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* Step 6 */}
          {step === 6 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Field label="Funding Stage" required>
                <select className="input-base" value={data.fundingStage} onChange={(e) => set("fundingStage", e.target.value as FundingStage)}>
                  {STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Amount Asking ($)" required>
                <input {...inp("askAmount")} placeholder="e.g. $5M" />
              </Field>
              <Field label="Pre-Money Valuation">
                <input {...inp("valuation")} placeholder="e.g. $28M" />
              </Field>
              <Field label="Runway">
                <input {...inp("runway")} placeholder="e.g. 18 months" />
              </Field>
              <div style={{ gridColumn: "1/-1" }}>
                <Field label="Use of Funds" required>
                  <textarea {...inp("useOfFunds")} rows={2} placeholder="e.g. 40% product, 35% sales, 25% infra" style={{ resize: "vertical" }} />
                </Field>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <Field label="Previous Funding">
                  <input {...inp("prevFunding")} placeholder="e.g. $1.2M Pre-Seed from Blume Ventures" />
                </Field>
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--bg-border)" }}>
            <button className="btn-secondary" onClick={goBack} disabled={step === 1} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ChevronLeft size={16} /> Back
            </button>
            <button className="btn-primary" onClick={goNext} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {step === 6 ? "Generate AI Report 🚀" : "Next"} {step < 6 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

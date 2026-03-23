import { VCFirm, StartupOnboarding, VCMatch, MatchBreakdown, VCPreferences, StartupProfile, StartupMatch } from "./types";

// ─── Weights ──────────────────────────────────────────────────────────────────

const WEIGHTS = {
  sector: 0.35,
  stage: 0.25,
  ticketSize: 0.20,
  geography: 0.10,
  businessModel: 0.10,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAmount(str: string): number {
  if (!str) return 0;
  const n = parseFloat(str.replace(/[^0-9.]/g, ""));
  if (isNaN(n)) return 0;
  if (str.toLowerCase().includes("cr")) return n * 0.12; // crore to $M approx
  if (str.toLowerCase().includes("l") || str.toLowerCase().includes("lakh")) return n * 0.000012;
  if (str.toLowerCase().includes("k")) return n / 1000;
  return n;
}

// ─── Score Functions ──────────────────────────────────────────────────────────

function scoreSector(vc: VCFirm, startup: StartupOnboarding): number {
  return vc.sectors.includes(startup.sector) ? 100 : 0;
}

function scoreStage(vc: VCFirm, startup: StartupOnboarding): number {
  if (vc.stages.includes(startup.fundingStage)) return 100;
  const stageOrder: Record<string, number> = {
    "Pre-Seed": 0, "Seed": 1, "Series A": 2, "Series B": 3, "Series C+": 4,
  };
  const startupIdx = stageOrder[startup.fundingStage] ?? 2;
  const minDist = Math.min(
    ...vc.stages.map((s) => Math.abs((stageOrder[s] ?? 2) - startupIdx))
  );
  return Math.max(0, 100 - minDist * 35);
}

function scoreTicketSize(vc: VCFirm, startup: StartupOnboarding): number {
  const ask = parseAmount(startup.askAmount);
  if (!ask) return 50;
  if (ask >= vc.ticketMin && ask <= vc.ticketMax) return 100;
  if (ask < vc.ticketMin) {
    const ratio = ask / vc.ticketMin;
    return Math.round(Math.max(0, ratio * 80));
  }
  const ratio = vc.ticketMax / ask;
  return Math.round(Math.max(0, ratio * 70));
}

function scoreGeography(vc: VCFirm, startup: StartupOnboarding): number {
  return vc.geographies.includes(startup.geography) ? 100 : 20;
}

function scoreBizModel(vc: VCFirm, startup: StartupOnboarding): number {
  return vc.businessModels.includes(startup.businessModel) ? 100 : 10;
}

// ─── Main Match Function ──────────────────────────────────────────────────────

export function computeVCMatch(vc: VCFirm, startup: StartupOnboarding): VCMatch {
  const breakdown: MatchBreakdown = {
    sector: scoreSector(vc, startup),
    stage: scoreStage(vc, startup),
    ticketSize: scoreTicketSize(vc, startup),
    geography: scoreGeography(vc, startup),
    businessModel: scoreBizModel(vc, startup),
  };

  const fitScore = Math.round(
    breakdown.sector * WEIGHTS.sector +
    breakdown.stage * WEIGHTS.stage +
    breakdown.ticketSize * WEIGHTS.ticketSize +
    breakdown.geography * WEIGHTS.geography +
    breakdown.businessModel * WEIGHTS.businessModel
  );

  const matchReasons: string[] = [];
  if (breakdown.sector === 100) matchReasons.push(`✓ Sector match: ${startup.sector}`);
  else matchReasons.push(`✗ Sector mismatch (they invest in ${vc.sectors.slice(0, 2).join(", ")})`);
  if (breakdown.stage >= 70) matchReasons.push(`✓ Stage aligned: ${startup.fundingStage}`);
  else matchReasons.push(`✗ Stage gap (prefer ${vc.stages.join(", ")})`);
  if (breakdown.ticketSize >= 80) matchReasons.push(`✓ Ticket size fits: $${vc.ticketMin}M–$${vc.ticketMax}M`);
  else matchReasons.push(`△ Ticket size partial fit (range $${vc.ticketMin}M–$${vc.ticketMax}M)`);
  if (breakdown.geography === 100) matchReasons.push(`✓ Geography: ${startup.geography}`);
  if (breakdown.businessModel === 100) matchReasons.push(`✓ Business model: ${startup.businessModel}`);

  return { vc, fitScore, breakdown, matchReasons };
}

export function rankVCsForStartup(vcs: VCFirm[], startup: StartupOnboarding): VCMatch[] {
  return vcs
    .map((vc) => computeVCMatch(vc, startup))
    .sort((a, b) => b.fitScore - a.fitScore);
}

// ─── VC → Startup Matching ────────────────────────────────────────────────────

export function computeStartupMatchForVC(prefs: VCPreferences | VCFirm, startup: StartupProfile): StartupMatch {
  // Normalise prefs — VCFirm is structurally compatible enough
  const vc = prefs as VCFirm;
  const o = startup.onboarding;

  const breakdown: MatchBreakdown = {
    sector: vc.sectors?.includes(o.sector) ? 100 : 0,
    stage: vc.stages?.includes(o.fundingStage) ? 100 : 30,
    ticketSize: scoreTicketSize(vc, o),
    geography: vc.geographies?.includes(o.geography) ? 100 : 20,
    businessModel: vc.businessModels?.includes(o.businessModel) ? 100 : 10,
  };

  const fitScore = Math.round(
    breakdown.sector * WEIGHTS.sector +
    breakdown.stage * WEIGHTS.stage +
    breakdown.ticketSize * WEIGHTS.ticketSize +
    breakdown.geography * WEIGHTS.geography +
    breakdown.businessModel * WEIGHTS.businessModel
  );

  const matchReasons: string[] = [];
  if (breakdown.sector === 100) matchReasons.push(`✓ Sector: ${o.sector}`);
  if (breakdown.stage === 100) matchReasons.push(`✓ Stage: ${o.fundingStage}`);
  if (breakdown.ticketSize >= 80) matchReasons.push(`✓ Ask fits your ticket range`);

  return { startup, fitScore, breakdown, matchReasons };
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "#22c55e"; // green
  if (score >= 70) return "#3b82f6"; // blue
  if (score >= 50) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export function getScoreBadgeClass(score: number): string {
  if (score >= 90) return "text-green-400 bg-green-400/10 ring-green-400/30";
  if (score >= 70) return "text-blue-400 bg-blue-400/10 ring-blue-400/30";
  if (score >= 50) return "text-amber-400 bg-amber-400/10 ring-amber-400/30";
  return "text-red-400 bg-red-400/10 ring-red-400/30";
}

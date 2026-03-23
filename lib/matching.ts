import { VCFirm, StartupOnboarding, VCMatch, MatchBreakdown, VCPreferences, StartupProfile, StartupMatch, TeamMember } from "./types";

// ─── Weights (M5 updated) ─────────────────────────────────────────────────────

const WEIGHTS = {
  sector: 0.28,
  stage: 0.20,
  ticketSize: 0.16,
  geography: 0.08,
  businessModel: 0.08,
  people: 0.20, // NEW — M5
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAmount(str: string): number {
  if (!str) return 0;
  const n = parseFloat(str.replace(/[^0-9.]/g, ""));
  if (isNaN(n)) return 0;
  if (str.toLowerCase().includes("cr")) return n * 0.12;
  if (str.toLowerCase().includes("l") || str.toLowerCase().includes("lakh")) return n * 0.000012;
  if (str.toLowerCase().includes("k")) return n / 1000;
  return n;
}

// ─── People Score (M5) ────────────────────────────────────────────────────────

export function computePeopleScore(onboarding: StartupOnboarding): number {
  // Prior exit experience: 30%
  const exitScore = Math.min(100, onboarding.founderPriorExits * 40 +
    (onboarding.teamMembers ?? []).reduce((s, m) => s + m.priorExits * 20, 0));

  // Domain expertise years: 20%
  const avgDomainYears = (() => {
    const members = onboarding.teamMembers ?? [];
    const founderYears = onboarding.founderDomainYears ?? 0;
    const allYears = [founderYears, ...members.map(m => m.domainExpertiseYears)];
    const avg = allYears.reduce((a, b) => a + b, 0) / allYears.length;
    return Math.min(100, avg * 8);
  })();

  // Institution tier: 15%
  const tierScore = (() => {
    const tierMap: Record<string, number> = {
      "Tier 1 (IIT/IIM/Ivy)": 100,
      "Tier 2 (NIT/State)": 60,
      "Tier 3 / Other": 30,
    };
    const founderTier = tierMap[onboarding.founderInstitutionTier ?? "Tier 3 / Other"];
    const members = onboarding.teamMembers ?? [];
    const memberTiers = members.map(m => tierMap[m.institutionTier] ?? 30);
    const all = [founderTier, ...memberTiers];
    return all.reduce((a, b) => a + b, 0) / all.length;
  })();

  // Team size: 20%
  const teamScore = Math.min(100, (onboarding.teamSize ?? 1) * 20);

  // LinkedIn signal: 15%
  const linkedinScore = Math.min(100, ((onboarding.founderLinkedinConnections ?? 0) / 500) * 100);

  const peopleScore = Math.round(
    exitScore * 0.30 +
    avgDomainYears * 0.20 +
    tierScore * 0.15 +
    teamScore * 0.20 +
    linkedinScore * 0.15
  );

  return Math.min(100, Math.max(0, peopleScore));
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
  const peopleScore = computePeopleScore(startup);

  const breakdown: MatchBreakdown = {
    sector: scoreSector(vc, startup),
    stage: scoreStage(vc, startup),
    ticketSize: scoreTicketSize(vc, startup),
    geography: scoreGeography(vc, startup),
    businessModel: scoreBizModel(vc, startup),
    people: peopleScore,
  };

  const fitScore = Math.round(
    breakdown.sector * WEIGHTS.sector +
    breakdown.stage * WEIGHTS.stage +
    breakdown.ticketSize * WEIGHTS.ticketSize +
    breakdown.geography * WEIGHTS.geography +
    breakdown.businessModel * WEIGHTS.businessModel +
    breakdown.people * WEIGHTS.people
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
  if (breakdown.people >= 70) matchReasons.push(`✓ Strong team signal (People Score: ${peopleScore})`);
  else matchReasons.push(`△ Team profile could be stronger (People Score: ${peopleScore})`);

  return { vc, fitScore, peopleScore, breakdown, matchReasons };
}

export function rankVCsForStartup(vcs: VCFirm[], startup: StartupOnboarding): VCMatch[] {
  return vcs
    .map((vc) => computeVCMatch(vc, startup))
    .sort((a, b) => b.fitScore - a.fitScore);
}

// ─── VC → Startup Matching ────────────────────────────────────────────────────

export function computeStartupMatchForVC(prefs: VCPreferences | VCFirm, startup: StartupProfile): StartupMatch {
  const vc = prefs as VCFirm;
  const o = startup.onboarding;

  const breakdown: MatchBreakdown = {
    sector: vc.sectors?.includes(o.sector) ? 100 : 0,
    stage: vc.stages?.includes(o.fundingStage) ? 100 : 30,
    ticketSize: scoreTicketSize(vc, o),
    geography: vc.geographies?.includes(o.geography) ? 100 : 20,
    businessModel: vc.businessModels?.includes(o.businessModel) ? 100 : 10,
    people: computePeopleScore(o),
  };

  const fitScore = Math.round(
    breakdown.sector * WEIGHTS.sector +
    breakdown.stage * WEIGHTS.stage +
    breakdown.ticketSize * WEIGHTS.ticketSize +
    breakdown.geography * WEIGHTS.geography +
    breakdown.businessModel * WEIGHTS.businessModel +
    breakdown.people * WEIGHTS.people
  );

  const matchReasons: string[] = [];
  if (breakdown.sector === 100) matchReasons.push(`✓ Sector: ${o.sector}`);
  if (breakdown.stage === 100) matchReasons.push(`✓ Stage: ${o.fundingStage}`);
  if (breakdown.ticketSize >= 80) matchReasons.push(`✓ Ask fits your ticket range`);
  if (breakdown.people >= 70) matchReasons.push(`✓ Strong team (People Score: ${breakdown.people})`);

  return { startup, fitScore, breakdown, matchReasons };
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "#22c55e";
  if (score >= 70) return "#3b82f6";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

export function getScoreBadgeClass(score: number): string {
  if (score >= 90) return "text-green-400 bg-green-400/10 ring-green-400/30";
  if (score >= 70) return "text-blue-400 bg-blue-400/10 ring-blue-400/30";
  if (score >= 50) return "text-amber-400 bg-amber-400/10 ring-amber-400/30";
  return "text-red-400 bg-red-400/10 ring-red-400/30";
}

// ─── Shared Types ────────────────────────────────────────────────────────────

export type UserRole = "startup" | "vc";

export type Sector =
  | "Fintech"
  | "SaaS"
  | "HealthTech"
  | "EdTech"
  | "DeepTech"
  | "CleanTech"
  | "E-commerce"
  | "AI/ML"
  | "Cybersecurity"
  | "Web3";

export type FundingStage =
  | "Pre-Seed"
  | "Seed"
  | "Series A"
  | "Series B"
  | "Series C+";

export type BusinessModel =
  | "B2B SaaS"
  | "B2C"
  | "Marketplace"
  | "D2C"
  | "Enterprise"
  | "API/Platform"
  | "Hardware"
  | "Consulting";

export type Geography =
  | "India"
  | "Southeast Asia"
  | "USA"
  | "Europe"
  | "Middle East"
  | "Global"
  | "Africa"
  | "LATAM";

// ─── Startup Onboarding ──────────────────────────────────────────────────────

export interface StartupOnboarding {
  // Step 1: Company Basics
  companyName: string;
  tagline: string;
  founded: string;
  website: string;
  sector: Sector;
  geography: Geography;

  // Step 2: Team
  founderName: string;
  founderRole: string;
  founderBio: string;
  teamSize: number;
  keyMembers: string;
  advisors: string;

  // Step 3: Business Model
  businessModel: BusinessModel;
  revenueModel: string;
  pricingStrategy: string;
  targetCustomer: string;

  // Step 4: Problem / Solution
  problem: string;
  solution: string;
  uniqueValueProp: string;
  competitiveAdvantage: string;

  // Step 5: Traction
  mrr: string;
  arr: string;
  customers: string;
  growthRate: string;
  keyMetrics: string;
  partnerships: string;

  // Step 6: Funding
  fundingStage: FundingStage;
  askAmount: string;
  useOfFunds: string;
  prevFunding: string;
  runway: string;
  valuation: string;
}

export const EMPTY_ONBOARDING: StartupOnboarding = {
  companyName: "",
  tagline: "",
  founded: "",
  website: "",
  sector: "Fintech",
  geography: "India",
  founderName: "",
  founderRole: "",
  founderBio: "",
  teamSize: 1,
  keyMembers: "",
  advisors: "",
  businessModel: "B2B SaaS",
  revenueModel: "",
  pricingStrategy: "",
  targetCustomer: "",
  problem: "",
  solution: "",
  uniqueValueProp: "",
  competitiveAdvantage: "",
  mrr: "",
  arr: "",
  customers: "",
  growthRate: "",
  keyMetrics: "",
  partnerships: "",
  fundingStage: "Seed",
  askAmount: "",
  useOfFunds: "",
  prevFunding: "",
  runway: "",
  valuation: "",
};

// ─── VC Firm ─────────────────────────────────────────────────────────────────

export interface VCFirm {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  description: string;
  sectors: Sector[];
  stages: FundingStage[];
  ticketMin: number; // in $M
  ticketMax: number; // in $M
  geographies: Geography[];
  businessModels: BusinessModel[];
  portfolioCount: number;
  aum: string; // e.g. "$500M"
  website: string;
  partners: string[];
}

// ─── Match ───────────────────────────────────────────────────────────────────

export interface MatchBreakdown {
  sector: number;
  stage: number;
  ticketSize: number;
  geography: number;
  businessModel: number;
}

export interface VCMatch {
  vc: VCFirm;
  fitScore: number;
  breakdown: MatchBreakdown;
  matchReasons: string[];
}

export interface StartupMatch {
  startup: StartupProfile;
  fitScore: number;
  breakdown: MatchBreakdown;
  matchReasons: string[];
}

// ─── Startup Profile (for VC view) ───────────────────────────────────────────

export interface StartupProfile {
  id: string;
  onboarding: StartupOnboarding;
  report?: AIReport;
  submittedAt: string;
}

// ─── AI Report ───────────────────────────────────────────────────────────────

export interface AIReportSection {
  key: string;
  title: string;
  content: string;
}

export interface AIReport {
  sections: AIReportSection[];
  generatedAt: string;
}

// ─── Submission ───────────────────────────────────────────────────────────────

export type SubmissionStatus =
  | "Submitted"
  | "Under Review"
  | "Interested"
  | "Passed";

export interface Submission {
  id: string;
  startupId: string;
  vcId: string;
  vcName: string;
  status: SubmissionStatus;
  submittedAt: string;
  updatedAt: string;
  vcNotes?: string;
  vcComment?: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  targetRole: UserRole;
  startupId?: string;
  vcId?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ─── VC Preferences ──────────────────────────────────────────────────────────

export interface VCPreferences {
  vcId: string;
  sectors: Sector[];
  stages: FundingStage[];
  ticketMin: number;
  ticketMax: number;
  geographies: Geography[];
  businessModels: BusinessModel[];
  watchlist: string[]; // startup IDs
  dealNotes: Record<string, string>;
  dealStatuses: Record<string, SubmissionStatus>;
}

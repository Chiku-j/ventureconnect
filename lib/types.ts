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

export type InstitutionTier = "Tier 1 (IIT/IIM/Ivy)" | "Tier 2 (NIT/State)" | "Tier 3 / Other";

// ─── Team Member (M5) ────────────────────────────────────────────────────────

export interface TeamMember {
  name: string;
  role: string;
  institution: string;
  institutionTier: InstitutionTier;
  degree: string;
  yearsExperience: number;
  priorExits: number;
  linkedinUrl: string;
  linkedinConnections: number;
  domainExpertiseYears: number;
}

// ─── Startup Onboarding ──────────────────────────────────────────────────────

export interface StartupOnboarding {
  // Step 1: Company Basics
  companyName: string;
  tagline: string;
  founded: string;
  website: string;
  sector: Sector;
  geography: Geography;

  // Step 2: Team (enhanced M5)
  founderName: string;
  founderRole: string;
  founderBio: string;
  founderPriorExits: number;
  founderDomainYears: number;
  founderInstitution: string;
  founderInstitutionTier: InstitutionTier;
  founderLinkedinUrl: string;
  founderLinkedinConnections: number;
  teamSize: number;
  teamMembers: TeamMember[];
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

export const EMPTY_TEAM_MEMBER: TeamMember = {
  name: "", role: "", institution: "", institutionTier: "Tier 2 (NIT/State)",
  degree: "", yearsExperience: 0, priorExits: 0, linkedinUrl: "",
  linkedinConnections: 0, domainExpertiseYears: 0,
};

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
  founderPriorExits: 0,
  founderDomainYears: 0,
  founderInstitution: "",
  founderInstitutionTier: "Tier 2 (NIT/State)",
  founderLinkedinUrl: "",
  founderLinkedinConnections: 0,
  teamSize: 1,
  teamMembers: [],
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
  people: number;
}

export interface VCMatch {
  vc: VCFirm;
  fitScore: number;
  peopleScore: number;
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

// ─── CRM Types (M7) ──────────────────────────────────────────────────────────

export type CRMStatus =
  | "Not Contacted"
  | "Email Sent"
  | "Replied"
  | "Meeting Scheduled"
  | "Passed"
  | "Ghosted";

export interface CRMActivity {
  id: string;
  type: "email" | "note" | "meeting" | "status_change";
  description: string;
  timestamp: string;
}

export interface CRMContact {
  id: string;
  vcId: string;
  vcName: string;
  status: CRMStatus;
  lastActivity: string;
  followUpDate?: string;
  notes: string;
  timeline: CRMActivity[];
  templateUsed?: string;
}

export interface CRMTemplate {
  id: string;
  name: string;
  subject: string;
  body: string; // uses {{company}}, {{founderName}}, {{vcName}} etc.
}

// ─── Founder Network Types (M8) ───────────────────────────────────────────────

export type PostType = "Update" | "Ask" | "Resource";
export type ReactionType = "Helpful" | "Inspiring" | "Relatable";

export interface NetworkPost {
  id: string;
  authorId: string;
  authorName: string;
  authorSector: string;
  authorStage: string;
  type: PostType;
  content: string;
  reactions: Record<ReactionType, string[]>; // reaction -> list of userIds who reacted
  createdAt: string;
}

export interface NetworkProfile {
  id: string;
  name: string;
  companyName: string;
  role: string;
  sector: Sector;
  stage: FundingStage;
  geography: Geography;
  expertiseTags: string[];
  needRightNow: string;
  openToConnect: boolean;
  bio: string;
  connections: string[]; // profile IDs
}

export interface DMMessage {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface DMThread {
  id: string; // `${userId1}-${userId2}` sorted
  participants: string[];
  messages: DMMessage[];
  lastMessage: string;
  lastTimestamp: string;
}

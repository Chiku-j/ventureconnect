import { NextRequest, NextResponse } from "next/server";
import { MOCK_VCS } from "@/lib/mockVCs";
import { MOCK_STARTUPS } from "@/lib/mockStartups";
import { rankVCsForStartup, computeStartupMatchForVC } from "@/lib/matching";
import { StartupOnboarding, VCPreferences } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === "startup") {
    // Startup → get ranked VC matches
    const onboarding: StartupOnboarding = body.onboarding;
    const matches = rankVCsForStartup(MOCK_VCS, onboarding);
    return NextResponse.json({ matches });
  }

  if (body.type === "vc") {
    // VC → get ranked startup matches
    const prefs: VCPreferences = body.prefs;
    // Build a pseudo VCFirm from prefs
    const pseudoFirm = {
      id: prefs.vcId,
      name: "You",
      logo: "Y",
      tagline: "",
      description: "",
      sectors: prefs.sectors,
      stages: prefs.stages,
      ticketMin: prefs.ticketMin,
      ticketMax: prefs.ticketMax,
      geographies: prefs.geographies,
      businessModels: prefs.businessModels,
      portfolioCount: 0,
      aum: "",
      website: "",
      partners: [],
    };
    const matches = MOCK_STARTUPS.map((s) =>
      computeStartupMatchForVC(pseudoFirm as any, s)
    ).sort((a, b) => b.fitScore - a.fitScore);
    return NextResponse.json({ matches });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

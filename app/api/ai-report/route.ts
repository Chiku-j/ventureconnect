import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { StartupOnboarding, AIReport } from "@/lib/types";

const SECTION_KEYS = [
  { key: "executive_summary", title: "Executive Summary" },
  { key: "problem_solution", title: "Problem & Solution" },
  { key: "market_opportunity", title: "Market Opportunity" },
  { key: "business_model", title: "Business Model" },
  { key: "competitive_landscape", title: "Competitive Landscape" },
  { key: "team_advisors", title: "Team & Advisors" },
  { key: "traction_milestones", title: "Traction & Milestones" },
  { key: "financial_projections", title: "Financial Projections" },
  { key: "funding_ask", title: "Funding Ask" },
];

function buildPrompt(data: StartupOnboarding): string {
  return `You are an expert venture capital analyst preparing a detailed investment research report.

Based on the following startup information, write a professional 9-section investment research report in Markdown format. Each section should be thorough, data-driven, and insightful, similar to a tier-1 VC firm's internal memo.

**Startup Data:**
- Company: ${data.companyName} (${data.tagline})
- Sector: ${data.sector} | Stage: ${data.fundingStage} | Geography: ${data.geography}
- Founded: ${data.founded}
- Business Model: ${data.businessModel}

**Team:**
- Founder: ${data.founderName} (${data.founderRole}) — ${data.founderBio}
- Team: ${data.keyMembers}
- Advisors: ${data.advisors}
- Team Size: ${data.teamSize}

**Problem & Solution:**
- Problem: ${data.problem}
- Solution: ${data.solution}
- Unique Value Proposition: ${data.uniqueValueProp}
- Competitive Advantage: ${data.competitiveAdvantage}

**Business Model:**
- Revenue Model: ${data.revenueModel}
- Pricing: ${data.pricingStrategy}
- Target Customer: ${data.targetCustomer}

**Traction (as of latest data):**
- MRR: ${data.mrr} | ARR: ${data.arr}
- Customers: ${data.customers}
- Growth Rate: ${data.growthRate}
- Key Metrics: ${data.keyMetrics}
- Partnerships: ${data.partnerships}

**Funding:**
- Ask: ${data.askAmount} at ${data.valuation} pre-money
- Use of Funds: ${data.useOfFunds}
- Previous Funding: ${data.prevFunding}
- Runway: ${data.runway}

Write the report with these exact 9 sections in JSON format. Return ONLY valid JSON, no markdown wrapping.

Format:
{
  "executive_summary": "## Executive Summary\\n...",
  "problem_solution": "## Problem & Solution\\n...",
  "market_opportunity": "## Market Opportunity\\n...",
  "business_model": "## Business Model\\n...",
  "competitive_landscape": "## Competitive Landscape\\n...",
  "team_advisors": "## Team & Advisors\\n...",
  "traction_milestones": "## Traction & Milestones\\n...",
  "financial_projections": "## Financial Projections\\n...",
  "funding_ask": "## Funding Ask\\n..."
}

Each section should be 150-250 words with specific numbers, market sizing, and VC-quality analysis.`;
}

function generateMockReport(data: StartupOnboarding): AIReport {
  const sections = SECTION_KEYS.map(({ key, title }) => {
    const content = getMockSection(key, data);
    return { key, title, content };
  });
  return { sections, generatedAt: new Date().toISOString() };
}

function getMockSection(key: string, d: StartupOnboarding): string {
  const sectionMap: Record<string, string> = {
    executive_summary: `## Executive Summary\n\n**${d.companyName}** is a ${d.sector} company building ${d.tagline.toLowerCase()}. Founded in ${d.founded} in ${d.geography}, the company operates on a **${d.businessModel}** model targeting ${d.targetCustomer}.\n\nThe company has demonstrated strong product-market fit with **ARR of ${d.arr}** growing at **${d.growthRate} MoM**, serving ${d.customers}. The founding team brings deep domain expertise with ${d.founderName} (${d.founderRole}) leading the charge.\n\n${d.companyName} is raising **${d.askAmount}** at a pre-money valuation of ${d.valuation} to accelerate ${d.useOfFunds}. With ${d.runway} of runway and strong unit economics, the company is well-positioned for its next phase of growth.`,

    problem_solution: `## Problem & Solution\n\n**The Problem:** ${d.problem}\n\nThis represents a significant market inefficiency that has persisted due to legacy systems and lack of technology-first solutions tailored to the specific needs of ${d.targetCustomer}.\n\n**The Solution:** ${d.solution}\n\n**Unique Value Proposition:** ${d.uniqueValueProp}\n\n**Sustainable Competitive Advantage:** ${d.competitiveAdvantage}\n\nThe solution addresses the root cause rather than symptoms, creating a defensible position in the market. Early customer adoption validates the strength of the product-market fit.`,

    market_opportunity: `## Market Opportunity\n\n${d.companyName} operates in the ${d.sector} sector in ${d.geography}, a market undergoing significant tailwinds driven by digital transformation, regulatory changes, and shifting consumer behavior.\n\n**Total Addressable Market (TAM):** The ${d.sector} market in ${d.geography} is estimated at $15–25B, growing at 25–35% CAGR through 2028.\n\n**Serviceable Addressable Market (SAM):** Focusing on ${d.targetCustomer}, the SAM is approximately $3–5B with clear segmentation opportunities.\n\n**Serviceable Obtainable Market (SOM):** With its current GTM strategy and competitive positioning, ${d.companyName} can realistically capture 1–3% market share within 5 years, implying a $150–300M revenue opportunity.\n\nThe timing is favorable: ${d.geography}'s digital infrastructure has matured sufficiently to support mass adoption of the product.`,

    business_model: `## Business Model\n\n**Revenue Model:** ${d.revenueModel}\n\n**Pricing Strategy:** ${d.pricingStrategy}\n\n**Target Customer Profile:** ${d.targetCustomer}\n\nThe ${d.businessModel} model provides high predictability of revenue and strong unit economics. The pricing strategy is well-calibrated to the target customer's willingness to pay while maintaining healthy margins.\n\n**Key Revenue Drivers:**\n- Expansion revenue from upsells and additional modules\n- Low customer acquisition cost through product-led growth\n- Strong retention driven by deep workflow integration\n\nThe gross margin profile for this type of business typically runs at 65–80%, which is consistent with a venture-scale outcome.`,

    competitive_landscape: `## Competitive Landscape\n\n${d.companyName} competes in a market with both established incumbents and emerging startups. Its key competitive differentiator is: **${d.competitiveAdvantage}**\n\n**Competitive Positioning:**\n| Competitor | Weakness | ${d.companyName} Advantage |\n|---|---|---|\n| Legacy Players | Not tech-native, expensive | Modern AI-first stack |\n| Global SaaS | Not built for ${d.geography} | Local-first, vernacular, compliance |\n| Other Startups | Early stage, limited features | Proven traction, deeper integrations |\n\nThe company's moat is built on proprietary data, deep integrations, and switching costs created through workflow dependency. Barriers to replication are meaningful and will strengthen over time as the data flywheel compounds.`,

    team_advisors: `## Team & Advisors\n\n**Founding Team:**\n\n**${d.founderName}** (${d.founderRole}) — ${d.founderBio}\n\n**Key Team Members:** ${d.keyMembers}\n\n**Advisors:** ${d.advisors}\n\n**Team Size:** ${d.teamSize} full-time employees\n\nThe founding team represents an ideal blend of domain expertise and technical capability. The team has direct experience in the problem space and has assembled complementary skills across product, engineering, and go-to-market.\n\nAdvisor quality is high, signaling strong domain credibility and access to networks. The team's ability to attract top talent and advisors at this stage reflects the quality of the opportunity and leadership.`,

    traction_milestones: `## Traction & Milestones\n\n${d.companyName} has achieved meaningful early traction that validates product-market fit:\n\n**Revenue Metrics:**\n- MRR: **${d.mrr}** | ARR: **${d.arr}**\n- Growth Rate: **${d.growthRate} MoM** (compounding)\n- Customer Count: **${d.customers}**\n\n**Operational Metrics:**\n${d.keyMetrics}\n\n**Strategic Partnerships:**\n${d.partnerships}\n\nThe growth trajectory is impressive at this stage. The combination of strong top-line growth with healthy unit economics (implied by the metrics above) suggests the company is not burning growth at the expense of sustainability.\n\n**Key Upcoming Milestones:** 2× customer base in 6 months, new product module launch, geographic expansion to Tier-2 markets.`,

    financial_projections: `## Financial Projections\n\n**Current Financial Position:**\n- Current ARR: ${d.arr}\n- Previous Funding: ${d.prevFunding}\n- Runway: ${d.runway}\n\n**3-Year Forecast (Base Case):**\n| Year | ARR | Customers | Headcount |\n|---|---|---|---|\n| Year 1 | ${parseFloat(d.arr || "0") > 0 ? `$${(parseFloat(d.arr.replace(/[^0-9.]/g, "")) * 3).toFixed(1)}M` : "3× current ARR"} | 3× current | ${Math.round(d.teamSize * 2)} |\n| Year 2 | 4× Year 1 | 5× current | ${Math.round(d.teamSize * 4)} |\n| Year 3 | 4× Year 2 | 10× current | ${Math.round(d.teamSize * 7)} |\n\nAssumptions: ${d.growthRate} growth rate sustained through Year 1, moderating to 8–12% MoM in Year 2–3 as the business scales. Gross margins expand to 70%+ at scale.\n\nThe path to Series B is clear at 18–24 months post-close, assuming execution on the set milestones.`,

    funding_ask: `## Funding Ask\n\n**Raise:** ${d.askAmount} at **${d.valuation} pre-money valuation**\n\n**Use of Funds:**\n${d.useOfFunds}\n\n**Previous Funding:** ${d.prevFunding}\n\n**Runway Post-Close:** ${d.runway} (extending to 24+ months with this raise)\n\n**Key Milestones This Capital Will Fund:**\n1. Scale ARR to 5× current within 18 months\n2. Expand to 2 new geographies / customer segments\n3. Hire 10–15 key roles across GTM and engineering\n4. Achieve break-even unit economics at the cohort level\n\n**Recommendation:** The ask is appropriately sized relative to the milestones, team capability, and market opportunity. The valuation is reasonable given the growth rate and sector comps. We recommend moving to the next round of due diligence.`,
  };

  return sectionMap[key] || `## ${key}\n\nAnalysis pending.`;
}

export async function POST(req: NextRequest) {
  try {
    const { onboarding }: { onboarding: StartupOnboarding } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return mock report
      const report = generateMockReport(onboarding);
      return NextResponse.json({ report });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = buildPrompt(onboarding);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = JSON.parse(jsonMatch[0]);

    const sections = SECTION_KEYS.map(({ key, title }) => ({
      key,
      title,
      content: parsed[key] || getMockSection(key, onboarding),
    }));

    const report: AIReport = { sections, generatedAt: new Date().toISOString() };
    return NextResponse.json({ report });
  } catch (err) {
    console.error("AI report error:", err);
    // Fallback to mock
    const { onboarding } = await req.json().catch(() => ({ onboarding: {} as StartupOnboarding }));
    const report = generateMockReport(onboarding as StartupOnboarding);
    return NextResponse.json({ report });
  }
}

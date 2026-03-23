import { NextRequest, NextResponse } from "next/server";
import { NetworkPost, NetworkProfile, PostType, ReactionType, DMThread, DMMessage, Sector, FundingStage, Geography } from "@/lib/types";

// ─── In-Memory Stores ─────────────────────────────────────────────────────────

const posts: NetworkPost[] = [
  {
    id: "post-1",
    authorId: "founder-1",
    authorName: "Aarav Singh",
    authorSector: "Fintech",
    authorStage: "Seed",
    type: "Update",
    content: "🎉 Just closed our seed round of $1.2M! Thank you to everyone who believed in us early. Now on to building. If you're in B2B SaaS payments, let's connect.",
    reactions: { Helpful: [], Inspiring: ["founder-2", "founder-3"], Relatable: ["founder-4"] },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-2",
    authorId: "founder-2",
    authorName: "Meera Nair",
    authorSector: "HealthTech",
    authorStage: "Series A",
    type: "Ask",
    content: "Looking for a VP Sales who has sold into hospitals before. Tier 1 cities, India focus. Happy to chat if you know someone great — equity + cash comp. DM me!",
    reactions: { Helpful: ["founder-1", "founder-3"], Inspiring: [], Relatable: ["founder-5"] },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-3",
    authorId: "founder-3",
    authorName: "Rahul Dev",
    authorSector: "SaaS",
    authorStage: "Pre-Seed",
    type: "Resource",
    content: "Sharing our fundraise data room template — took us 3 months to figure out what VCs actually want. Notion link in comments. Hope it saves you time 🙏",
    reactions: { Helpful: ["founder-1", "founder-2", "founder-4", "founder-5"], Inspiring: ["founder-1"], Relatable: [] },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-4",
    authorId: "founder-4",
    authorName: "Priya Sharma",
    authorSector: "EdTech",
    authorStage: "Seed",
    type: "Update",
    content: "4 months ago we had 200 users. Today: 12,000 MAU, 38% retention. We built nothing fancy — just obsessed over onboarding. Happy to share what worked.",
    reactions: { Helpful: ["founder-2"], Inspiring: ["founder-1", "founder-3", "founder-5"], Relatable: ["founder-2"] },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const profiles: NetworkProfile[] = [
  {
    id: "founder-1", name: "Aarav Singh", companyName: "FinFlow AI", role: "CEO & Co-founder",
    sector: "Fintech", stage: "Seed", geography: "India",
    expertiseTags: ["Payments", "B2B SaaS", "GTM"], needRightNow: "Introductions to CFOs at mid-market companies",
    openToConnect: true, bio: "Ex-Razorpay, building the AI-native CFO for SMEs.", connections: ["founder-2", "founder-3"],
  },
  {
    id: "founder-2", name: "Meera Nair", companyName: "NovaMed", role: "CEO",
    sector: "HealthTech", stage: "Series A", geography: "India",
    expertiseTags: ["Clinical AI", "Hospital Sales", "Diagnostics"], needRightNow: "VP Sales referrals",
    openToConnect: true, bio: "Doctor turned founder. Using AI to bring diagnostics to tier-2 India.", connections: ["founder-1"],
  },
  {
    id: "founder-3", name: "Rahul Dev", companyName: "GridZero", role: "CTO & Co-founder",
    sector: "CleanTech", stage: "Pre-Seed", geography: "India",
    expertiseTags: ["Energy Tech", "IoT", "Hardware"], needRightNow: "Angel investors for pre-seed bridge",
    openToConnect: true, bio: "IIT Delhi. 8 years in energy systems. Building zero-carbon infra for commercial buildings.", connections: [],
  },
  {
    id: "founder-4", name: "Priya Sharma", companyName: "LearnLift", role: "Founder",
    sector: "EdTech", stage: "Seed", geography: "India",
    expertiseTags: ["User Onboarding", "Product-Led Growth", "Vernacular Ed"], needRightNow: "Paid marketing partner",
    openToConnect: true, bio: "Ex-BYJU's PM. Building micro-courses for India's workforce.", connections: ["founder-1"],
  },
  {
    id: "founder-5", name: "Dev Kapoor", companyName: "SecureStack", role: "CEO",
    sector: "Cybersecurity", stage: "Series A", geography: "India",
    expertiseTags: ["Cloud Security", "DevSecOps", "Enterprise Sales"], needRightNow: "US design partner",
    openToConnect: false, bio: "Ex-Palo Alto Networks. Making cloud-native security simple.", connections: [],
  },
];

const threads: Map<string, DMThread> = new Map();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function threadId(a: string, b: string) {
  return [a, b].sort().join("--");
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "feed") {
    return NextResponse.json({ posts: posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
  }

  if (action === "discover") {
    const sector = searchParams.get("sector");
    const stage = searchParams.get("stage");
    const geo = searchParams.get("geo");
    let filtered = profiles.filter(p => p.openToConnect);
    if (sector && sector !== "All") filtered = filtered.filter(p => p.sector === sector);
    if (stage && stage !== "All") filtered = filtered.filter(p => p.stage === stage);
    if (geo && geo !== "All") filtered = filtered.filter(p => p.geography === geo);
    return NextResponse.json({ profiles: filtered });
  }

  if (action === "profile") {
    const id = searchParams.get("id") ?? "founder-1";
    const profile = profiles.find(p => p.id === id);
    return NextResponse.json({ profile: profile ?? profiles[0] });
  }

  if (action === "threads") {
    const userId = searchParams.get("userId") ?? "founder-1";
    const userThreads = [...threads.values()].filter(t => t.participants.includes(userId));
    return NextResponse.json({ threads: userThreads });
  }

  if (action === "messages") {
    const tid = searchParams.get("threadId") ?? "";
    return NextResponse.json({ thread: threads.get(tid) ?? null });
  }

  return NextResponse.json({ profiles });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === "post") {
    const { authorId, authorName, authorSector, authorStage, type, content } = body;
    const post: NetworkPost = {
      id: `post-${Date.now()}`,
      authorId, authorName, authorSector, authorStage,
      type: type as PostType,
      content,
      reactions: { Helpful: [], Inspiring: [], Relatable: [] },
      createdAt: new Date().toISOString(),
    };
    posts.unshift(post);
    return NextResponse.json({ post });
  }

  if (action === "react") {
    const { postId, userId, reaction } = body as { postId: string; userId: string; reaction: ReactionType };
    const post = posts.find(p => p.id === postId);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const arr = post.reactions[reaction];
    if (arr.includes(userId)) {
      post.reactions[reaction] = arr.filter(id => id !== userId);
    } else {
      post.reactions[reaction] = [...arr, userId];
    }
    return NextResponse.json({ post });
  }

  if (action === "updateProfile") {
    const { id, updates } = body;
    const idx = profiles.findIndex(p => p.id === id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    profiles[idx] = { ...profiles[idx], ...updates };
    return NextResponse.json({ profile: profiles[idx] });
  }

  if (action === "connect") {
    const { fromId, toId } = body;
    const from = profiles.find(p => p.id === fromId);
    const to = profiles.find(p => p.id === toId);
    if (!from || !to) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!from.connections.includes(toId)) from.connections.push(toId);
    if (!to.connections.includes(fromId)) to.connections.push(fromId);
    return NextResponse.json({ success: true });
  }

  if (action === "sendMessage") {
    const { fromId, toId, content } = body;
    const tid = threadId(fromId, toId);
    const existing = threads.get(tid);
    const msg: DMMessage = {
      id: `msg-${Date.now()}`,
      fromId, toId, content,
      timestamp: new Date().toISOString(),
      read: false,
    };
    if (existing) {
      existing.messages.push(msg);
      existing.lastMessage = content;
      existing.lastTimestamp = msg.timestamp;
      threads.set(tid, existing);
    } else {
      threads.set(tid, {
        id: tid,
        participants: [fromId, toId],
        messages: [msg],
        lastMessage: content,
        lastTimestamp: msg.timestamp,
      });
    }
    return NextResponse.json({ thread: threads.get(tid) });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

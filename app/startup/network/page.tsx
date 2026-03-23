"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { NetworkPost, PostType, ReactionType } from "@/lib/types";
import { Plus, X, Globe, Lightbulb, HelpCircle, Heart } from "lucide-react";

const POST_TYPES: { type: PostType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: "Update", label: "Update", icon: <Globe size={13} />, color: "#818cf8" },
  { type: "Ask", label: "Ask",    icon: <HelpCircle size={13} />, color: "#f59e0b" },
  { type: "Resource", label: "Resource", icon: <Lightbulb size={13} />, color: "#4ade80" },
];

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "Helpful", emoji: "🤝", label: "Helpful" },
  { type: "Inspiring", emoji: "🚀", label: "Inspiring" },
  { type: "Relatable", emoji: "💯", label: "Relatable" },
];

const TYPE_COLORS: Record<PostType, { bg: string; text: string; border: string }> = {
  Update:   { bg: "rgba(99,102,241,0.1)",  text: "#818cf8", border: "rgba(99,102,241,0.2)" },
  Ask:      { bg: "rgba(245,158,11,0.1)",  text: "#fbbf24", border: "rgba(245,158,11,0.2)" },
  Resource: { bg: "rgba(34,197,94,0.1)",   text: "#4ade80", border: "rgba(34,197,94,0.2)" },
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NetworkFeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<NetworkPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newType, setNewType] = useState<PostType>("Update");
  const [newContent, setNewContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [myId] = useState("founder-me");
  const [myName, setMyName] = useState("Arjun (You)");
  const [filterType, setFilterType] = useState<PostType | "All">("All");

  useEffect(() => {
    const raw = localStorage.getItem("startup_onboarding");
    if (raw) {
      const o = JSON.parse(raw);
      if (o.founderName) setMyName(o.founderName);
    }
  }, []);

  const load = useCallback(async () => {
    const res = await fetch("/api/network?action=feed");
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const submitPost = async () => {
    if (!newContent.trim()) return;
    setPosting(true);
    const raw = localStorage.getItem("startup_onboarding");
    const o = raw ? JSON.parse(raw) : {};
    await fetch("/api/network", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "post",
        authorId: myId,
        authorName: myName,
        authorSector: o.sector ?? "Fintech",
        authorStage: o.fundingStage ?? "Seed",
        type: newType,
        content: newContent,
      }),
    });
    setNewContent("");
    setCreating(false);
    setPosting(false);
    load();
  };

  const react = async (postId: string, reaction: ReactionType) => {
    const res = await fetch("/api/network", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "react", postId, userId: myId, reaction }),
    });
    const data = await res.json();
    setPosts(prev => prev.map(p => p.id === postId ? data.post : p));
  };

  const filtered = filterType === "All" ? posts : posts.filter(p => p.type === filterType);

  return (
    <AppShell role="startup" onRoleSwitch={() => router.push("/vc/onboarding")}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em", margin: "0 0 4px" }}>Founder Network</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>Peer community — no VCs here 🙅</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" onClick={() => router.push("/startup/network/discover")} style={{ fontSize: 13 }}>
              Find Founders
            </button>
            <button className="btn-secondary" onClick={() => router.push("/startup/network/messages")} style={{ fontSize: 13 }}>
              Messages
            </button>
            <button className="btn-primary" onClick={() => setCreating(true)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13 }}>
              <Plus size={14} /> Post
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {(["All", "Update", "Ask", "Resource"] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none",
                background: filterType === t ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                color: filterType === t ? "#818cf8" : "var(--text-muted)",
                transition: "all 0.15s",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Create post panel */}
        {creating && (
          <div className="card fade-slide-up" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {POST_TYPES.map(pt => (
                  <button
                    key={pt.type}
                    onClick={() => setNewType(pt.type)}
                    style={{
                      padding: "5px 14px", borderRadius: 20, fontSize: 12, display: "flex", alignItems: "center", gap: 5,
                      border: "none", cursor: "pointer",
                      background: newType === pt.type ? `${pt.color}20` : "rgba(255,255,255,0.05)",
                      color: newType === pt.type ? pt.color : "var(--text-muted)",
                      transition: "all 0.15s",
                    }}
                  >
                    {pt.icon} {pt.label}
                  </button>
                ))}
              </div>
              <button className="btn-ghost" onClick={() => setCreating(false)} style={{ padding: 4 }}><X size={16} /></button>
            </div>
            <textarea
              className="input-base"
              rows={4}
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder={
                newType === "Update" ? "Share a milestone, win, or lesson... 🎉" :
                newType === "Ask" ? "What do you need from the community? Be specific 🙏" :
                "Share a useful resource, tool, or template 💡"
              }
              style={{ resize: "none", marginBottom: 12, fontSize: 14 }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
              <button className="btn-primary" onClick={submitPost} disabled={posting || !newContent.trim()}>
                {posting ? "Posting..." : "Post Update"}
              </button>
            </div>
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[...Array(3)].map((_, i) => <div key={i} className="card shimmer" style={{ height: 160 }} />)}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((post, idx) => {
              const tc = TYPE_COLORS[post.type];
              return (
                <div key={post.id} className="card fade-slide-up" style={{ padding: 20, animationDelay: `${idx * 0.05}s` }}>
                  {/* Author row */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, fontWeight: 800, color: "#818cf8",
                      }}>
                        {post.authorName[0]}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{post.authorName}</p>
                        <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0 }}>{post.authorSector} · {post.authorStage}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`, borderRadius: 10, padding: "2px 9px", fontSize: 10, fontWeight: 700 }}>
                        {post.type.toUpperCase()}
                      </span>
                      <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <p style={{ fontSize: 14, lineHeight: 1.65, margin: "0 0 16px", color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>
                    {post.content}
                  </p>

                  {/* Reactions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {REACTIONS.map(r => {
                      const reacted = post.reactions[r.type].includes(myId);
                      const count = post.reactions[r.type].length;
                      return (
                        <button
                          key={r.type}
                          onClick={() => react(post.id, r.type)}
                          style={{
                            padding: "4px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                            border: reacted ? `1px solid rgba(99,102,241,0.4)` : "1px solid rgba(255,255,255,0.08)",
                            background: reacted ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
                            color: reacted ? "#818cf8" : "var(--text-muted)",
                            transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5,
                          }}
                        >
                          {r.emoji} {r.label} {count > 0 && <span style={{ fontWeight: 700 }}>{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

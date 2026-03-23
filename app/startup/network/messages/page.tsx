"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { DMThread, DMMessage } from "@/lib/types";
import { Send, MessageSquare } from "lucide-react";

const MOCK_PROFILES: Record<string, { name: string; sector: string }> = {
  "founder-1": { name: "Aarav Singh", sector: "Fintech" },
  "founder-2": { name: "Meera Nair", sector: "HealthTech" },
  "founder-3": { name: "Rahul Dev", sector: "CleanTech" },
  "founder-4": { name: "Priya Sharma", sector: "EdTech" },
};

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const withParam = searchParams.get("with");

  const [threads, setThreads] = useState<DMThread[]>([]);
  const [activeThread, setActiveThread] = useState<DMThread | null>(null);
  const [activePartnerId, setActivePartnerId] = useState<string>(withParam ?? "founder-1");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const myId = "founder-me";
  const myName = "Arjun (You)";
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async () => {
    const res = await fetch(`/api/network?action=threads&userId=${myId}`);
    const data = await res.json();
    setThreads(data.threads ?? []);
  }, []);

  const loadThread = useCallback(async (partnerId: string) => {
    const tid = [myId, partnerId].sort().join("--");
    const res = await fetch(`/api/network?action=messages&threadId=${tid}`);
    const data = await res.json();
    setActiveThread(data.thread);
    setActivePartnerId(partnerId);
  }, []);

  useEffect(() => {
    loadThreads();
    loadThread(withParam ?? "founder-1");
  }, [loadThreads, loadThread, withParam]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages]);

  const send = async () => {
    if (!input.trim()) return;
    setSending(true);
    const res = await fetch("/api/network", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sendMessage", fromId: myId, toId: activePartnerId, content: input }),
    });
    const data = await res.json();
    setActiveThread(data.thread);
    setInput("");
    setSending(false);
    loadThreads();
  };

  const partner = MOCK_PROFILES[activePartnerId];

  return (
    <AppShell role="startup" onRoleSwitch={() => router.push("/vc/onboarding")}>
      <div style={{ maxWidth: 900, margin: "0 auto", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em", margin: "0 0 2px" }}>Messages</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>1:1 conversations with connected founders</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16, flex: 1, minHeight: 0 }}>
          {/* Sidebar — threads */}
          <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--bg-border)" }}>
              <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Conversations</p>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {Object.entries(MOCK_PROFILES).map(([id, p]) => {
                const isActive = activePartnerId === id;
                return (
                  <div
                    key={id}
                    onClick={() => loadThread(id)}
                    style={{
                      padding: "12px 16px", cursor: "pointer",
                      background: isActive ? "rgba(99,102,241,0.1)" : "transparent",
                      borderLeft: isActive ? "2px solid #6366f1" : "2px solid transparent",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 700, color: "#818cf8",
                      }}>
                        {p.name[0]}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 12, margin: 0 }}>{p.name}</p>
                        <p style={{ color: "var(--text-muted)", fontSize: 10, margin: 0 }}>{p.sector}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat pane */}
          <div className="card" style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--bg-border)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 700, color: "#818cf8",
              }}>
                {partner?.name[0]}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{partner?.name}</p>
                <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0 }}>{partner?.sector}</p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {!activeThread || activeThread.messages.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
                  <MessageSquare size={32} color="var(--text-muted)" />
                  <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center" }}>
                    Start the conversation with {partner?.name}
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {activeThread.messages.map(msg => {
                    const isMe = msg.fromId === myId;
                    return (
                      <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                        <div style={{
                          maxWidth: "70%", padding: "10px 14px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                          background: isMe ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
                          border: isMe ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.08)",
                        }}>
                          <p style={{ fontSize: 13, margin: "0 0 4px", lineHeight: 1.5, color: "var(--text-primary)" }}>{msg.content}</p>
                          <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0, textAlign: isMe ? "right" : "left" }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--bg-border)", display: "flex", gap: 10 }}>
              <input
                className="input-base"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                style={{ flex: 1, fontSize: 13 }}
              />
              <button
                className="btn-primary"
                onClick={send}
                disabled={sending || !input.trim()}
                style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: 5 }}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

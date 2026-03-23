"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, TrendingUp, ChevronRight, Sparkles, BarChart3, Shield } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const chooseRole = (role: "startup" | "vc") => {
    localStorage.setItem("vc_role", role);
    if (role === "startup") router.push("/startup/onboarding");
    else router.push("/vc/onboarding");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%), #0a0a0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div className={mounted ? "fade-slide-up" : ""} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 40px rgba(99,102,241,0.4)",
          }}
        >
          <Zap size={24} color="white" />
        </div>
        <h1 style={{ fontWeight: 800, fontSize: 28, letterSpacing: "-0.04em", margin: 0 }}>
          Venture<span style={{ color: "#6366f1" }}>Connect</span>
        </h1>
      </div>

      {/* Hero */}
      <div
        className={mounted ? "fade-slide-up" : ""}
        style={{ textAlign: "center", maxWidth: 640, marginBottom: 60, animationDelay: "0.1s" }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 20,
            padding: "5px 14px",
            fontSize: 12,
            color: "#818cf8",
            fontWeight: 600,
            marginBottom: 20,
            letterSpacing: "0.04em",
          }}
        >
          <Sparkles size={12} /> AI-POWERED MATCHING ENGINE
        </div>
        <h2
          style={{
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            margin: "0 0 16px",
            lineHeight: 1.1,
            background: "linear-gradient(135deg, #f1f1f5 30%, #6366f1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Where Startups Meet the Right Capital
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 18, lineHeight: 1.6, margin: 0 }}>
          AI-generated investment research reports. Weighted fit scoring. One platform for founders and VCs.
        </p>
      </div>

      {/* Features pills */}
      <div
        className={mounted ? "fade-slide-up" : ""}
        style={{ display: "flex", gap: 12, marginBottom: 52, flexWrap: "wrap", justifyContent: "center", animationDelay: "0.2s" }}
      >
        {[
          { icon: BarChart3, label: "9-Section AI Reports" },
          { icon: TrendingUp, label: "Weighted Fit Scores" },
          { icon: Shield, label: "Secure Submission Flow" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 30,
              padding: "8px 16px",
              fontSize: 13,
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            <Icon size={14} color="#6366f1" /> {label}
          </div>
        ))}
      </div>

      {/* Role Choice Cards */}
      <div
        className={mounted ? "fade-slide-up" : ""}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 640, width: "100%", animationDelay: "0.3s" }}
      >
        {/* Startup */}
        <button
          onClick={() => chooseRole("startup")}
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 16,
            padding: 28,
            cursor: "pointer",
            textAlign: "left",
            transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(99,102,241,0.25)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.6)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.3)";
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>🚀</div>
          <h3 style={{ fontWeight: 700, fontSize: 18, margin: "0 0 6px", color: "#f1f1f5" }}>
            I&apos;m a Founder
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.5 }}>
            Onboard your startup, generate an AI investment report, and get matched with VCs.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#818cf8", fontSize: 13, fontWeight: 600 }}>
            Get started <ChevronRight size={14} />
          </div>
        </button>

        {/* VC */}
        <button
          onClick={() => chooseRole("vc")}
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(168,85,247,0.08))",
            border: "1px solid rgba(139,92,246,0.3)",
            borderRadius: 16,
            padding: 28,
            cursor: "pointer",
            textAlign: "left",
            transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(139,92,246,0.25)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.6)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.3)";
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>💼</div>
          <h3 style={{ fontWeight: 700, fontSize: 18, margin: "0 0 6px", color: "#f1f1f5" }}>
            I&apos;m a VC Analyst
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.5 }}>
            Set your thesis, browse AI-scored startups, and manage your deal pipeline.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#a78bfa", fontSize: 13, fontWeight: 600 }}>
            Explore pipeline <ChevronRight size={14} />
          </div>
        </button>
      </div>

      <p style={{ marginTop: 32, color: "var(--text-muted)", fontSize: 12 }}>
        Demo prototype • No real investment decisions are made
      </p>
    </div>
  );
}

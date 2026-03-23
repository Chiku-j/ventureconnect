"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Users, Briefcase, BookOpen,
  Star, ChevronRight, Zap, TrendingUp, Database, Mail, Network
} from "lucide-react";
import NotificationPanel from "./NotificationPanel";
import { UserRole } from "@/lib/types";

interface SidebarProps {
  role: UserRole;
  onRoleSwitch: () => void;
}

const STARTUP_NAV = [
  { href: "/startup/onboarding", label: "Onboarding", icon: FileText },
  { href: "/startup/report", label: "My Report", icon: BookOpen },
  { href: "/startup/matches", label: "VC Matches", icon: Users },
  { href: "/startup/submissions", label: "My Submissions", icon: Briefcase },
  { href: "/startup/vc-database", label: "VC Database", icon: Database },
  { href: "/startup/crm", label: "Outreach CRM", icon: Mail },
  { href: "/startup/network", label: "Founder Network", icon: Network },
];

const VC_NAV = [
  { href: "/vc/onboarding", label: "Set Thesis", icon: LayoutDashboard },
  { href: "/vc/pipeline", label: "Pipeline", icon: TrendingUp },
  { href: "/vc/watchlist", label: "Watchlist", icon: Star },
];

export default function AppShell({
  role,
  onRoleSwitch,
  children,
}: {
  role: UserRole;
  onRoleSwitch: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const nav = role === "startup" ? STARTUP_NAV : VC_NAV;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: "#111118",
          borderRight: "1px solid #1e1e2a",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={16} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>
              Venture<span style={{ color: "#6366f1" }}>Connect</span>
            </span>
          </div>
        </div>

        {/* Role badge */}
        <div style={{ padding: "0 12px 16px" }}>
          <div
            style={{
              background: role === "startup" ? "rgba(99,102,241,0.12)" : "rgba(139,92,246,0.12)",
              border: `1px solid ${role === "startup" ? "rgba(99,102,241,0.25)" : "rgba(139,92,246,0.25)"}`,
              borderRadius: 8,
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Signed in as
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, margin: "2px 0 0", color: role === "startup" ? "#818cf8" : "#a78bfa" }}>
                {role === "startup" ? "Arjun (Founder)" : "Priya (VC Analyst)"}
              </p>
            </div>
            <button
              onClick={onRoleSwitch}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                padding: "4px 8px",
                fontSize: 11,
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              Switch
            </button>
          </div>
        </div>

        <hr className="divider" style={{ margin: "0 12px 12px" }} />

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 4px 8px" }}>
            {role === "startup" ? "Founder Workspace" : "VC Dashboard"}
          </p>
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname === href || pathname.startsWith(href + "/") ? "active" : ""}`}
            >
              <Icon size={16} />
              {label}
              {(pathname === href || pathname.startsWith(href + "/")) && (
                <ChevronRight size={12} style={{ marginLeft: "auto", opacity: 0.5 }} />
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: 16, borderTop: "1px solid #1e1e2a" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
          VentureConnect MVP • v1.1
          </p>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 240, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Top bar */}
        <header
          style={{
            height: 56,
            background: "rgba(10,10,15,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #1e1e2a",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <NotificationPanel role={role} />
        </header>

        {/* Page */}
        <main style={{ flex: 1, padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

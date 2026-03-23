import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VentureConnect — AI-Powered Startup & VC Marketplace",
  description:
    "Connect high-potential startups with the right venture capital firms using AI-driven matching and automated investment research reports.",
  keywords: ["venture capital", "startup funding", "AI matching", "investment research"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning style={{ margin: 0, minHeight: "100vh", background: "#0a0a0f" }}>
        {children}
      </body>
    </html>
  );
}

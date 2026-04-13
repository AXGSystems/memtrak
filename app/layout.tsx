import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./sidebar";

export const metadata: Metadata = {
  title: "MEMTrak — Email Intelligence Platform",
  description: "Member Engagement & Membership Tracking — ALTA's internal email tracking, analytics, and hygiene platform.",
  icons: { icon: '/alta-shield.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex">
        <Sidebar />
        <main className="flex-1 ml-56 min-h-screen">{children}</main>
      </body>
    </html>
  );
}

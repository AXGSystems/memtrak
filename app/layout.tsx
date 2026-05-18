import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./sidebar";
import TopBar from "./topbar";
import ClientShell from "./client-shell";

export const metadata: Metadata = {
  title: "MEMTrak — Association Management & Email Intelligence",
  description: "AMS plus email intelligence for membership organizations — members, dues, events, groups, documents, member portal, and 48 branded analytics tools.",
  icons: { icon: '/alta-shield.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="deep-blue" className="h-full antialiased">
      <body className="min-h-full flex">
        <Sidebar />
        <main className="flex-1 lg:ml-[260px] min-h-screen">
          <TopBar />
          {children}
        </main>
        <ClientShell />
      </body>
    </html>
  );
}

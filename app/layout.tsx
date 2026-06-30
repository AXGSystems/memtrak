import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "./sidebar";
import TopBar from "./topbar";
import ClientShell from "./client-shell";

export const metadata: Metadata = {
  title: "MEMTrak — Association Management & Email Intelligence",
  description: "AMS plus email intelligence for membership organizations — members, dues, events, groups, documents, member portal, and 48 branded analytics tools.",
  icons: { icon: '/alta-shield.png' },
};

// Explicit viewport (Next 16 — separate `viewport` export, not inside metadata).
// The repo's AGENTS.md warns this Next build has breaking changes, so the
// implicit `width=device-width, initial-scale=1` default is made explicit here
// to guarantee correct mobile scaling. `viewport-fit=cover` lets fixed chrome
// (hamburger, drawers) honor env(safe-area-inset-*) on notched phones.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Anti-FOUC: apply the persisted theme synchronously, before first paint, so
// non-default users never see a Midnight flash on a full page load. Runs ahead
// of hydration; topbar.tsx then reads the same value to seed its React state.
const themeBootstrap = `(function(){try{var t=localStorage.getItem('memtrak-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="deep-blue" className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-full flex">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Sidebar />
        <main
          id="main-content"
          aria-label="Main content"
          className="flex-1 lg:ml-[260px] min-h-[100dvh] min-w-0 overflow-x-hidden"
        >
          <TopBar />
          {children}
        </main>
        <ClientShell />
      </body>
    </html>
  );
}

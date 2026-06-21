import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeApplier } from "@/components/ThemeApplier";
import { AuthProvider } from "@/components/AuthProvider";
import { asset } from "@/lib/utils";

export const metadata: Metadata = {
  title: { default: "LearnFerno", template: "%s · LearnFerno" },
  description:
    "Make flashcards and quizzes, then study them in fiery little games. Import and export your sets anytime.",
  applicationName: "LearnFerno",
  icons: { icon: asset("/icon.svg"), apple: asset("/icon.svg") },
};

export const viewport: Viewport = {
  themeColor: "#140805",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Applies the saved theme before first paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{
var s=(JSON.parse(localStorage.getItem('lf-settings')||'{}').state)||{};
var d=document.documentElement;
var t=s.theme||'inferno';
if(t==='system'){t=matchMedia('(prefers-color-scheme: light)').matches?'ash':'inferno';}
d.setAttribute('data-theme',t);
d.setAttribute('data-density',s.density||'cozy');
d.setAttribute('data-glass',s.glass===false?'off':'on');
d.setAttribute('data-animations',s.animations===false?'off':'on');
if(s.accent){d.style.setProperty('--accent',s.accent);d.style.setProperty('--accent-soft','color-mix(in srgb, '+s.accent+' 16%, transparent)');}
var rmap={sharp:'6px',soft:'18px',round:'28px'};if(s.radius){d.style.setProperty('--radius',rmap[s.radius]||'18px');}
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <div className="app-backdrop" />
        <ThemeApplier />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

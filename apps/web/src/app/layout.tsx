import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "CareerForge AI — Intelligent Career Acceleration Hub",
    template: "%s | CareerForge AI",
  },
  description:
    "AI-powered resume analysis, dynamic matching across all company tiers, verified recruiter contacts, and Google X-Y-Z resume tailoring.",
  keywords: [
    "resume builder",
    "job matching",
    "startup jobs",
    "FAANG resume",
    "cold outreach",
    "recruiter intelligence",
  ],
  authors: [{ name: "CareerForge AI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CareerForge AI",
    title: "CareerForge AI — Evidence-Backed Job Application Intelligence",
    description:
      "Automated resume analysis, high-match job discovery, and verified recruiter outreach.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#010103" },
    { media: "(prefers-color-scheme: dark)", color: "#010103" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${plusJakarta.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased selection:bg-purple-500/30 selection:text-purple-200">
        <TooltipProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}

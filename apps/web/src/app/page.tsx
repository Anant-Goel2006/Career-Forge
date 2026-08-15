"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Target,
  Sparkles,
  Download,
  Shield,
  BarChart3,
  CheckCircle2,
  Zap,
  Send,
  Wand2,
  Upload,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { CareerForgeLogo } from "@/components/brand/CareerForgeLogo";
import { CareerHero } from "@/components/hero/CareerHero";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ROUTES } from "@/lib/constants";

const FEATURES = [
  {
    icon: FileText,
    title: "AI Resume Doctor",
    description: "Deep section extraction with 100% evidence verification without hallucinated claims.",
    badge: "Core Engine",
  },
  {
    icon: Target,
    title: "Transparent Matcher",
    description: "9 transparent sub-scores breaking down skills, experience, and domain alignment.",
    badge: "Matching",
  },
  {
    icon: Wand2,
    title: "FAANG Tailor Studio",
    description: "Generates high-impact STAR formatted bullet points optimized for target job descriptions.",
    badge: "Tailoring",
  },
  {
    icon: Send,
    title: "Outreach Intelligence",
    description: "Personalized LinkedIn connection notes and cold emails drafted from your verified experience.",
    badge: "Outreach",
  },
  {
    icon: Bot,
    title: "Career Assistant",
    description: "RAG-grounded guidance for salary negotiations, interview prep, and roadmap strategy.",
    badge: "AI Co-pilot",
  },
  {
    icon: Download,
    title: "FAANG 1-Pager Export",
    description: "Industry-standard single page clean DOCX & PDF templates ready for instant submission.",
    badge: "Export",
  },
];

const STEPS = [
  { step: "01", title: "Upload Resume", description: "Drop your existing PDF or DOCX" },
  { step: "02", title: "Evidence Audit", description: "Get a comprehensive health report" },
  { step: "03", title: "Match Target Role", description: "Paste job post for 9-score analysis" },
  { step: "04", title: "Tailor & Outbound", description: "Generate custom bullets & cold DMs" },
  { step: "05", title: "Export 1-Pager", description: "Download optimized FAANG format" },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-violet-600/[0.08] blur-[140px]" />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center">
            <CareerForgeLogo variant="full" size="md" />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-xs font-semibold text-zinc-400 transition hover:text-white">
              Features
            </Link>
            <Link href="#workflow" className="text-xs font-semibold text-zinc-400 transition hover:text-white">
              Workflow
            </Link>
            <Link href={ROUTES.JOBS} className="text-xs font-semibold text-zinc-400 transition hover:text-white">
              Job Matcher
            </Link>
            <Link href={ROUTES.OUTREACH} className="text-xs font-semibold text-zinc-400 transition hover:text-white">
              Outreach AI
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.DASHBOARD}
              className="cf-button-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold"
            >
              <span>Launch Studio</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 space-y-20">
        {/* Hero */}
        <CareerHero />

        {/* Features Section */}
        <section id="features" className="space-y-10">
          <SectionHeading
            badge="Advanced Modules"
            badgeIcon={<Sparkles className="h-3.5 w-3.5 text-purple-400" />}
            title="Engineered for"
            gradientTitle="Serious Candidates"
            description="A cohesive suite of career acceleration tools that never fabricate claims, ensuring every bullet is grounded in your real achievements."
            align="center"
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <GlassCard key={feat.title} className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-purple-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-bold text-zinc-400">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                    <p className="text-xs leading-relaxed text-zinc-400">{feat.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-purple-400">
                    <span>Explore module</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </section>

        {/* 5-Step Workflow */}
        <section id="workflow" className="space-y-10">
          <SectionHeading
            badge="Seamless Journey"
            title="From Raw Resume to"
            gradientTitle="Signed Offer"
            description="5 streamlined phases designed to elevate your interview conversion rate."
            align="center"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {STEPS.map((step) => (
              <GlassCard key={step.step} className="p-5 flex flex-col items-center text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-sm font-extrabold text-purple-300">
                  {step.step}
                </div>
                <h4 className="text-xs font-bold text-white mb-1">{step.title}</h4>
                <p className="text-[11px] text-zinc-400">{step.description}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Bottom Call to Action Card */}
        <section className="pb-12">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.12] bg-gradient-to-r from-purple-950/[0.4] via-[#09090B] to-black p-8 sm:p-14 text-center">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.25),transparent_60%)]" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Ready to <span className="cf-text-gradient">Forge Your Legacy</span>?
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Join thousands of software engineers, product managers, and data analysts who land top-tier roles faster with CareerForge AI.
              </p>

              <div className="pt-3 flex justify-center">
                <Link
                  href={ROUTES.DASHBOARD}
                  className="cf-button-primary inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold shadow-[0_0_30px_rgba(255,255,255,0.25)]"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <CareerForgeLogo variant="full" size="sm" />
          <p>© {new Date().getFullYear()} CareerForge AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-zinc-300">Privacy Policy</Link>
            <Link href="#" className="hover:text-zinc-300">Terms of Service</Link>
            <Link href="#" className="hover:text-zinc-300">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

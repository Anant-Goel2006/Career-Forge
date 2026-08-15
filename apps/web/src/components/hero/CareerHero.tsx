"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Upload, TrendingUp, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

// Lazy-load the 3D canvas scene with SSR disabled for optimal performance
const CareerForgeScene = dynamic(
  () => import("./CareerForgeScene").then((mod) => mod.CareerForgeScene),
  {
    ssr: false,
    loading: () => <div className="h-full w-full" />,
  }
);

export function CareerHero() {
  return (
    <section className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.04] via-transparent to-purple-950/[0.15] backdrop-blur-2xl">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-[450px] w-[450px] rounded-full bg-violet-600/[0.14] blur-[100px]" />
      <div className="pointer-events-none absolute left-1/3 bottom-0 h-[300px] w-[300px] rounded-full bg-purple-500/[0.08] blur-[80px]" />

      <div className="grid grid-cols-1 items-center gap-8 px-6 py-10 sm:px-10 lg:grid-cols-12 lg:py-12">
        {/* Left Column: Text & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="z-10 lg:col-span-7"
        >
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold text-purple-300 backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>AI-Powered Application Intelligence</span>
          </div>

          <h1 className="text-3xl font-extrabold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl lg:text-[3.3rem]">
            Forge Your Future.
            <br />
            <span className="cf-text-gradient">Build Your Legacy.</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Evidence-grounded resume tailoring, transparent job requirement matching, and high-converting cold outreach messages.
          </p>

          {/* Action Buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={ROUTES.UPLOAD}
              className="cf-button-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold sm:text-sm"
            >
              <Upload className="h-4 w-4" />
              Upload Resume
            </Link>

            <Link
              href={ROUTES.JOBS}
              className="cf-button-secondary inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-semibold sm:text-sm"
            >
              Analyze Job
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </Link>
          </div>

          {/* Real System Feature Badges (Zero fake reviews) */}
          <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-white/[0.06] pt-5 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>100% Evidence-Grounded</span>
            </div>
            <span className="text-zinc-600">•</span>
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Zero Hallucinations</span>
            </div>
            <span className="text-zinc-600">•</span>
            <span className="font-medium text-zinc-400">FAANG-Standard Formats</span>
          </div>
        </motion.div>

        {/* Right Column: 3D Live Visual Canvas */}
        <div className="relative flex h-[280px] w-full items-center justify-center lg:col-span-5 lg:h-[340px]">
          <CareerForgeScene />
        </div>
      </div>
    </section>
  );
}

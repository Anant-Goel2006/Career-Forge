"use client";

import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, Upload } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export interface ResumeScoreCardProps {
  score?: number | null;
}

export function ResumeScoreCard({ score = null }: ResumeScoreCardProps) {
  const hasScore = typeof score === "number" && score > 0;

  return (
    <GlassCard className="flex h-full flex-col justify-between p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Resume Score
        </span>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
          <TrendingUp className="h-3.5 w-3.5 text-purple-400" />
        </div>
      </div>

      {/* Score Number & Status */}
      <div className="my-5">
        {hasScore ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
                <AnimatedNumber value={score} />
              </span>
              <span className="text-sm font-semibold text-zinc-500">/100</span>
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span>{score >= 80 ? "Excellent" : score >= 60 ? "Good Readiness" : "Needs Optimization"}</span>
              {score >= 80 && <span>👑</span>}
            </div>

            {/* Gradient Progress Bar */}
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-white via-purple-300 to-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.8)]"
              />
            </div>

            <p className="mt-3 text-xs text-zinc-400">
              Health audit generated from your verified resume evidence.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-zinc-500 sm:text-5xl">
                --
              </span>
              <span className="text-sm font-semibold text-zinc-600">/100</span>
            </div>

            <div className="mt-1 text-xs font-medium text-zinc-500">
              Awaiting First Upload
            </div>

            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05] border border-dashed border-white/[0.1]" />

            <p className="mt-3 text-xs leading-relaxed text-zinc-400">
              Upload a resume to automatically calculate your evidence health score.
            </p>
          </>
        )}
      </div>

      {/* Action Button */}
      <Link
        href={ROUTES.UPLOAD}
        className="cf-button-secondary flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-zinc-200 hover:text-white"
      >
        <span>{hasScore ? "View Full Audit" : "Upload Resume"}</span>
        {hasScore ? (
          <ArrowRight className="h-3.5 w-3.5 text-purple-400" />
        ) : (
          <Upload className="h-3.5 w-3.5 text-purple-400" />
        )}
      </Link>
    </GlassCard>
  );
}

"use client";

import { useState } from "react";
import { Briefcase, ArrowRight, Sparkles, MapPin } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { GlassCard } from "@/components/ui/GlassCard";

interface JobMatchData {
  title: string;
  company: string;
  location?: string;
  matchScore: number;
}

export function TopJobMatch({ job }: { job?: JobMatchData | null }) {
  const hasJob = Boolean(job && job.title);

  return (
    <GlassCard className="flex h-full flex-col justify-between p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Target Job Match
        </span>
        <Link
          href={ROUTES.JOBS}
          className="text-xs font-semibold text-zinc-400 transition-colors hover:text-white"
        >
          {hasJob ? "View All" : "Open Matcher"}
        </Link>
      </div>

      {/* Body */}
      <div className="my-4">
        {hasJob && job ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-purple-300">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-white">
                  {job.title}
                </h3>
                <p className="text-xs text-zinc-400">{job.company}</p>
                {job.location && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500">
                    <MapPin className="h-3 w-3 shrink-0 text-zinc-400" />
                    <span className="truncate">{job.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-bold text-purple-300">
                <Sparkles className="h-3 w-3 text-purple-400" />
                {job.matchScore}% Match
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-500">
              <Briefcase className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-zinc-300">No Job Analyzed Yet</h4>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              Paste a target job description to compute real-time requirement match scores.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.06] pt-3">
        <Link
          href={ROUTES.JOBS}
          className="cf-button-secondary flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-zinc-200 hover:text-white"
        >
          <span>{hasJob ? "View Match Report" : "Analyze Target Job"}</span>
          <ArrowRight className="h-3.5 w-3.5 text-purple-400" />
        </Link>
      </div>
    </GlassCard>
  );
}

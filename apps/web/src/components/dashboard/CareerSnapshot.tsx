"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export interface CareerSnapshotProps {
  resumesCount?: number;
  jobsCount?: number;
  matchesCount?: number;
  outreachCount?: number;
  applicationsCount?: number;
  skillsCount?: number;
}

export function CareerSnapshot({
  resumesCount = 0,
  jobsCount = 0,
  matchesCount = 0,
  outreachCount = 0,
  applicationsCount = 0,
  skillsCount = 0,
}: CareerSnapshotProps) {
  const metrics = [
    { label: "Resumes Uploaded", value: resumesCount },
    { label: "Jobs Analyzed", value: jobsCount },
    { label: "Matches Generated", value: matchesCount },
    { label: "Outreach Drafts", value: outreachCount },
    { label: "Applications Tracked", value: applicationsCount },
    { label: "Verified Skills", value: skillsCount },
  ];

  return (
    <GlassCard className="flex h-full flex-col justify-between p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Career Workspace Snapshot
        </span>
        <span className="text-[11px] font-medium text-zinc-500">Live Workspace</span>
      </div>

      {/* 6 Real Metrics Grid */}
      <div className="my-4 grid grid-cols-3 gap-x-4 gap-y-4">
        {metrics.map((item) => (
          <div key={item.label} className="flex flex-col">
            <span className="text-[11px] font-medium text-zinc-500">
              {item.label}
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-white sm:text-2xl">
                <AnimatedNumber value={item.value} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Glowing Minimal Spline Trend Chart (SVG) */}
      <div className="relative mt-2 h-14 w-full overflow-hidden">
        <svg
          viewBox="0 0 400 60"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="snapshotGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Area fill under curve */}
          <path
            d="M 0,50 C 60,48 120,42 180,45 C 240,48 300,35 360,40 C 380,42 400,38 400,38 L 400,60 L 0,60 Z"
            fill="url(#snapshotGrad)"
          />

          {/* Glowing Stroke Curve */}
          <path
            d="M 0,50 C 60,48 120,42 180,45 C 240,48 300,35 360,40 C 380,42 400,38 400,38"
            fill="none"
            stroke="#A78BFA"
            strokeWidth="2"
            filter="url(#glowFilter)"
          />

          {/* Nodes */}
          <circle cx="180" cy="45" r="3" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="2" />
          <circle cx="360" cy="40" r="3.5" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="2" className="animate-pulse" />
        </svg>
      </div>
    </GlassCard>
  );
}

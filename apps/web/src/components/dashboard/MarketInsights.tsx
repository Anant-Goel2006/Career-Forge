"use client";

import { Sparkles, TrendingUp, DollarSign, Briefcase } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export interface MarketInsightsProps {
  targetRole?: string;
  topSkills?: string;
  demandTrend?: string;
  salaryRange?: string;
  marketStatus?: string;
}

export function MarketInsights({
  targetRole = "Software & Data Intelligence",
  topSkills = "System Design, Python, React, AI/LLMs",
  demandTrend = "High Growth (+24% YoY)",
  salaryRange = "$120K - $185K",
  marketStatus = "Actively Hiring Across Tech",
}: MarketInsightsProps) {
  const items = [
    {
      icon: Sparkles,
      label: "Top Target Skills",
      value: topSkills,
    },
    {
      icon: TrendingUp,
      label: "Role Demand Trend",
      value: demandTrend,
    },
    {
      icon: DollarSign,
      label: "Benchmark Comp",
      value: salaryRange,
    },
    {
      icon: Briefcase,
      label: "Hiring Climate",
      value: marketStatus,
    },
  ];

  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between border-b border-white/[0.06] pb-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
          Target Role Market Intelligence • {targetRole}
        </span>
        <span className="text-[10px] text-zinc-500 font-medium">Real-time Industry Data</span>
      </div>

      <div className="grid grid-cols-1 gap-4 divide-y divide-white/[0.06] sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={`flex items-center gap-3.5 ${
              index !== 0 ? "pt-3 sm:pt-0 sm:pl-5" : ""
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-purple-300">
              <item.icon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium text-zinc-400">{item.label}</p>
              <p className="truncate text-xs font-bold text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

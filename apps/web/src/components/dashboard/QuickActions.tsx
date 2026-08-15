"use client";

import Link from "next/link";
import { FileText, Target, Send, Bot } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { GlassCard } from "@/components/ui/GlassCard";

const ACTIONS = [
  {
    title: "Resume Doctor",
    subtitle: "Upload & Health Audit",
    icon: FileText,
    href: ROUTES.UPLOAD,
  },
  {
    title: "Job Matcher",
    subtitle: "Requirements & Fit",
    icon: Target,
    href: ROUTES.JOBS,
  },
  {
    title: "Cold Outreach AI",
    subtitle: "LinkedIn DMs & Emails",
    icon: Send,
    href: ROUTES.OUTREACH,
  },
  {
    title: "AI Career Assistant",
    subtitle: "RAG Copilot Guidance",
    icon: Bot,
    href: ROUTES.ASSISTANT,
  },
];

export function QuickActions() {
  return (
    <GlassCard className="p-6">
      <div className="mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Core Workspaces
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIONS.map((action) => (
          <Link key={action.title} href={action.href}>
            <div className="group flex h-full items-center gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-purple-500/40 hover:bg-white/[0.06] hover:shadow-[0_0_25px_rgba(139,92,246,0.15)]">
              {/* Glowing Icon Container */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-purple-300 transition-colors group-hover:border-purple-500/40 group-hover:bg-purple-500/20 group-hover:text-purple-200">
                <action.icon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h4 className="truncate text-xs font-bold text-white transition-colors group-hover:text-purple-200">
                  {action.title}
                </h4>
                <p className="truncate text-[11px] text-zinc-400">
                  {action.subtitle}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}

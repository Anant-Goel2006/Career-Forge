"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Search,
  Send,
  Bot,
  ChevronLeft,
} from "lucide-react";
import { CareerForgeLogo } from "@/components/brand/CareerForgeLogo";
import { ROUTES } from "@/lib/constants";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

/** Professional streamlined navigation items */
const SIDEBAR_ITEMS: NavItem[] = [
  { label: "Overview", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Resume Studio", href: ROUTES.UPLOAD, icon: FileText },
  { label: "Job Matcher", href: ROUTES.JOBS, icon: Search },
  { label: "Cold Outreach AI", href: ROUTES.OUTREACH, icon: Send },
  { label: "Executive AI Architect", href: ROUTES.ASSISTANT, icon: Bot, badge: "AI" },
];

export function AppSidebar({
  collapsed = false,
  onToggleCollapse,
  onCloseMobile,
}: {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === ROUTES.DASHBOARD) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`relative flex h-full flex-col border-r border-white/[0.08] bg-[#010103]/95 backdrop-blur-3xl transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* 1. Header / Logo */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-white/[0.06]">
        <Link href={ROUTES.DASHBOARD} onClick={onCloseMobile} className="flex items-center">
          <CareerForgeLogo variant={collapsed ? "mark" : "full"} size="md" />
        </Link>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-white"
            aria-label="Toggle sidebar collapse"
          >
            <ChevronLeft
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      {/* 2. Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {SIDEBAR_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onCloseMobile}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                active
                  ? "cf-sidebar-active"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  active ? "text-purple-300" : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              />

              {!collapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}

              {!collapsed && item.badge && (
                <span className="rounded-full border border-purple-500/40 bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-purple-300">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

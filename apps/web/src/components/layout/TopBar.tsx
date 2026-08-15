"use client";

import { Bell, Plus, Menu, Sparkles } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

interface TopBarProps {
  onOpenMobileMenu?: () => void;
}

export function TopBar({ onOpenMobileMenu }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/[0.06] bg-[#030305]/85 px-4 backdrop-blur-2xl sm:px-8">
      {/* Left: Mobile Menu Button & Active Workspace Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-300 transition hover:bg-white/[0.08] lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-200">
          <Sparkles className="h-3 w-3 text-purple-400" />
          <span>Executive Career Intelligence Suite</span>
        </div>
      </div>

      {/* Right Controls: New Resume Action Button */}
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.UPLOAD}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.18] bg-white/[0.08] px-4 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(255,255,255,0.06)] transition-all hover:bg-white hover:text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-95"
        >
          <span>Upload Resume</span>
          <Plus className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { GlassCard } from "@/components/ui/GlassCard";

export function CareerAssistantCard() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      router.push(ROUTES.ASSISTANT);
      return;
    }
    router.push(`${ROUTES.ASSISTANT}?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <GlassCard className="flex h-full flex-col justify-between p-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Career Assistant
          </span>
          <span className="rounded-full border border-purple-500/40 bg-purple-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-purple-300">
            AI
          </span>
        </div>

        {/* Content & Glowing Orb Visual */}
        <div className="my-3.5 flex items-center justify-between gap-3">
          <p className="text-xs sm:text-sm font-medium leading-snug text-zinc-200">
            How can I assist your career search today?
          </p>

          {/* 3D Glowing Purple AI Sphere Orb */}
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
            {/* Outer ambient glow */}
            <div className="absolute inset-0 rounded-full bg-purple-600/30 blur-md" />
            {/* Sphere Body */}
            <div className="relative h-9 w-9 rounded-full border border-purple-300/40 bg-gradient-to-tr from-[#1E1B4B] via-[#6D28D9] to-[#C4B5FD] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_0_15px_rgba(139,92,246,0.5)]">
              {/* Specular highlight */}
              <div className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-white/70 blur-[0.5px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative mt-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything about your career..."
          className="w-full rounded-2xl border border-white/[0.09] bg-white/[0.03] py-2.5 pl-3.5 pr-11 text-xs text-white placeholder-zinc-500 backdrop-blur-xl transition-all focus:border-purple-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-purple-500/50"
        />

        <button
          type="submit"
          className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-xl bg-purple-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.6)] transition-all hover:bg-purple-500 active:scale-95"
          aria-label="Send query to Assistant"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </button>
      </form>
    </GlassCard>
  );
}

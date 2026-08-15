import React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl",
        "border border-white/[0.08]",
        "bg-white/[0.035]",
        "backdrop-blur-2xl",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_80px_rgba(0,0,0,0.45)]",
        glow && "border-purple-500/30 shadow-[0_0_40px_rgba(139,92,246,0.12)]",
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-white/[0.055] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_25px_90px_rgba(0,0,0,0.55),0_0_35px_rgba(139,92,246,0.08)]",
        className
      )}
      {...props}
    >
      {/* Subtle top reflection line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {children}
    </div>
  );
}

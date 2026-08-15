import React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  badge?: string;
  badgeIcon?: React.ReactNode;
  title: string;
  gradientTitle?: string;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export function SectionHeading({
  badge,
  badgeIcon,
  title,
  gradientTitle,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  const alignClass = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end",
  }[align];

  return (
    <div className={cn("flex flex-col space-y-2", alignClass, className)}>
      {badge && (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-300 backdrop-blur-xl">
          {badgeIcon}
          {badge}
        </div>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
        {title}{" "}
        {gradientTitle && (
          <span className="cf-text-gradient">{gradientTitle}</span>
        )}
      </h2>
      {description && (
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

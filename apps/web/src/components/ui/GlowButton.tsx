import React from "react";
import { cn } from "@/lib/utils";

export interface GlowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "purple" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function GlowButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: GlowButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-xs font-semibold rounded-xl gap-1.5",
    md: "px-6 py-3 text-sm font-semibold rounded-full gap-2",
    lg: "px-8 py-3.5 text-base font-bold rounded-full gap-2.5",
  };

  const variantClasses = {
    primary: "cf-button-primary",
    secondary: "cf-button-secondary",
    purple: "cf-button-purple",
    ghost:
      "bg-transparent text-zinc-300 hover:text-white hover:bg-white/[0.06] border border-transparent transition-all",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center cursor-pointer select-none transition-all duration-200 active:scale-[0.98]",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

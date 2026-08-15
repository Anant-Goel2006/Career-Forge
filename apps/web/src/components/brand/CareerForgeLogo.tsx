"use client";

import Image from "next/image";
import { useState } from "react";

export interface CareerForgeLogoProps {
  variant?: "mark" | "wordmark" | "full";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: {
    mark: 26,
    text: "text-sm",
    subtext: "text-[8px]",
  },
  md: {
    mark: 34,
    text: "text-base",
    subtext: "text-[9px]",
  },
  lg: {
    mark: 46,
    text: "text-xl",
    subtext: "text-[10px]",
  },
};

/**
 * Fallback SVG icon in case the image fails or before public/brand/logo.svg loads.
 */
function FallbackMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]"
    >
      <polygon points="60,10 20,60 40,60 60,35" fill="#FFFFFF" />
      <polygon points="60,10 100,60 80,60 60,35" fill="#8B5CF6" />
      <polygon points="20,60 60,110 60,85 40,60" fill="#A78BFA" />
      <polygon points="100,60 60,110 60,85 80,60" fill="#4C1D95" />
      <polygon points="60,35 40,60 60,85 80,60" fill="#050505" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
    </svg>
  );
}

export function CareerForgeLogo({
  variant = "full",
  size = "md",
  className = "",
}: CareerForgeLogoProps) {
  const [imageError, setImageError] = useState(false);
  const s = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {variant !== "wordmark" && (
        <div
          className="relative flex shrink-0 items-center justify-center"
          style={{
            width: s.mark,
            height: s.mark,
          }}
        >
          {!imageError ? (
            <Image
              src="/brand/logo.svg"
              alt="CareerForge"
              width={s.mark}
              height={s.mark}
              priority
              className="object-contain drop-shadow-[0_0_12px_rgba(139,92,246,0.4)]"
              onError={() => setImageError(true)}
            />
          ) : (
            <FallbackMark size={s.mark} />
          )}
        </div>
      )}

      {variant !== "mark" && (
        <div className="flex flex-col leading-none">
          <span
            className={`${s.text} font-extrabold tracking-[-0.03em] text-white`}
          >
            CAREER<span className="cf-text-gradient">FORGE</span>
          </span>

          {variant === "full" && (
            <span
              className={`mt-1 font-semibold uppercase tracking-[0.22em] text-zinc-400 ${s.subtext}`}
            >
              Forge Your Future
            </span>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

interface BackButtonProps {
  label?: string;
  href?: string;
  className?: string;
}

export function BackButton({ label = "Back", href, className = "" }: BackButtonProps) {
  const router = useRouter();

  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-purple-500/40 hover:bg-white/[0.06] hover:text-white transition-all backdrop-blur-xl group ${className}`}
      >
        <ArrowLeft className="h-3.5 w-3.5 text-zinc-400 group-hover:-translate-x-0.5 group-hover:text-purple-300 transition-transform" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-purple-500/40 hover:bg-white/[0.06] hover:text-white transition-all backdrop-blur-xl group ${className}`}
    >
      <ArrowLeft className="h-3.5 w-3.5 text-zinc-400 group-hover:-translate-x-0.5 group-hover:text-purple-300 transition-transform" />
      <span>{label}</span>
    </button>
  );
}

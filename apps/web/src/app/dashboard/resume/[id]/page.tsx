"use client";

/**
 * CareerForge AI — Resume Intelligence & Health Audit Hub.
 * Visual section inspector, verified evidence items & actionable health recommendations.
 */

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Target,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Check,
  Copy,
  Download,
  BookOpen,
  Briefcase,
  GraduationCap,
  Wrench,
  Layers,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BackButton } from "@/components/ui/BackButton";
import { resumeApi, type ResumeResponse, type AuditResponse } from "@/lib/api-client";
import { ROUTES } from "@/lib/constants";

const SECTION_ICONS: Record<string, React.ReactNode> = {
  experience: <Briefcase className="h-4 w-4 text-purple-400" />,
  education: <GraduationCap className="h-4 w-4 text-cyan-400" />,
  skills: <Wrench className="h-4 w-4 text-emerald-400" />,
  projects: <Layers className="h-4 w-4 text-amber-400" />,
  summary: <BookOpen className="h-4 w-4 text-purple-300" />,
  general: <FileText className="h-4 w-4 text-zinc-400" />,
};

export default function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: resumeId } = use(params);

  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [audit, setAudit] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sections" | "evidence">("sections");

  useEffect(() => {
    async function loadResume() {
      if (!resumeId) return;
      try {
        setLoading(true);
        const data = await resumeApi.get(resumeId);
        setResume(data);

        // Auto-run or load initial audit
        try {
          const auditResult = await resumeApi.audit(resumeId);
          setAudit(auditResult);
          if (typeof window !== "undefined") {
            localStorage.setItem("careerforge_latest_score", auditResult.overall_score.toString());
            localStorage.setItem("careerforge_latest_resume_id", resumeId);
          }
        } catch {
          // If audit fails, resume still displays
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load resume.");
      } finally {
        setLoading(false);
      }
    }

    loadResume();
  }, [resumeId]);

  const handleRunAudit = async () => {
    if (!resumeId) return;
    setAuditing(true);
    try {
      const auditResult = await resumeApi.audit(resumeId);
      setAudit(auditResult);
      if (typeof window !== "undefined") {
        localStorage.setItem("careerforge_latest_score", auditResult.overall_score.toString());
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Audit failed.");
    } finally {
      setAuditing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <p className="text-xs text-zinc-400 animate-pulse">Loading resume intelligence...</p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="mx-auto max-w-xl py-12 space-y-4">
        <Link
          href={ROUTES.DASHBOARD}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
        <GlassCard className="p-6 text-center border-red-500/30 bg-red-500/10">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-sm font-bold text-red-300">Error Loading Resume</p>
          <p className="mt-1 text-xs text-zinc-400">{error || "Resume not found."}</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 pb-12"
    >
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="mb-2">
            <BackButton label="Back to Overview" href={ROUTES.DASHBOARD} />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {resume.original_filename}
            </h1>
            <span className="rounded-full border border-purple-500/40 bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
              {resume.source_type}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunAudit}
            disabled={auditing}
            className="cf-button-secondary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white"
          >
            {auditing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            )}
            <span>{audit ? "Re-run Health Audit" : "Run Health Audit"}</span>
          </button>

          <Link
            href={ROUTES.JOBS}
            className="cf-button-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold"
          >
            <Target className="h-3.5 w-3.5" />
            <span>Match against Job</span>
          </Link>
        </div>
      </div>

      {/* Health Audit Card (if available) */}
      {audit && (
        <GlassCard className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Resume Evidence Health Score
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white sm:text-4xl">
                {audit.overall_score}
              </span>
              <span className="text-xs font-semibold text-zinc-500">/100</span>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">{audit.summary}</p>

          {/* Strengths */}
          {audit.strengths.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Verified Strengths
              </p>
              <div className="flex flex-wrap gap-2">
                {audit.strengths.map((str, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300 font-medium"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {str}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Recommendations */}
          {audit.issues.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Actionable Improvements ({audit.issues.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {audit.issues.map((issue, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs leading-relaxed space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{issue.message}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                          issue.severity === "critical"
                            ? "bg-red-500/20 text-red-300 border border-red-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">Fix: {issue.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {/* Main Content Tabs: Parsed Sections vs Verified Evidence Items */}
      <div className="space-y-4">
        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
          <button
            onClick={() => setActiveTab("sections")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "sections"
                ? "bg-white/[0.08] text-white border border-white/[0.12]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-purple-400" />
            <span>Extracted Sections ({resume.sections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("evidence")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "evidence"
                ? "bg-white/[0.08] text-white border border-white/[0.12]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Verified Evidence Items ({resume.evidence_items.length})</span>
          </button>
        </div>

        {/* Content View */}
        {activeTab === "sections" ? (
          <div className="space-y-4">
            {resume.sections.length === 0 ? (
              <GlassCard className="p-8 text-center text-xs text-zinc-400">
                No sections parsed yet.
              </GlassCard>
            ) : (
              resume.sections.map((section) => (
                <GlassCard key={section.id} className="p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                    <div className="flex items-center gap-2">
                      {SECTION_ICONS[section.section_type.toLowerCase()] || SECTION_ICONS.general}
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                        {section.section_type}
                      </span>
                    </div>
                  </div>

                  <p className="whitespace-pre-wrap font-sans text-xs text-zinc-200 leading-relaxed">
                    {section.raw_text}
                  </p>
                </GlassCard>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {resume.evidence_items.length === 0 ? (
              <GlassCard className="p-8 text-center text-xs text-zinc-400">
                No evidence items found. Evidence items are extracted during document analysis to ground claims.
              </GlassCard>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {resume.evidence_items.map((item) => (
                  <GlassCard key={item.id} className="p-4 flex items-start gap-3">
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 mt-0.5 ${
                        item.verified ? "text-emerald-400" : "text-zinc-500"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white leading-snug">{item.claim_text}</p>
                      {item.source_span && (
                        <span className="mt-1.5 inline-block rounded border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[10px] text-purple-300 font-medium">
                          Source: {item.source_span}
                        </span>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

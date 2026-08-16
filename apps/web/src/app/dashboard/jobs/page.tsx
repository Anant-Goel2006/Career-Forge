"use client";

/**
 * CareerForge AI — Job Analyzer & High-Match Intelligence Hub.
 * Uses real API-sourced jobs via the backend matching engine.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Loader2,
  Sparkles,
  Search,
  Building2,
  MapPin,
  ExternalLink,
  Target,
  Zap,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { BackButton } from "@/components/ui/BackButton";
import { jobApi, type JobResponse } from "@/lib/api-client";
import { ROUTES } from "@/lib/constants";

export default function JobsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"recommended" | "analyzer">("recommended");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocationFilter] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Data states
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);

  // Permission Modal State
  const [permissionModalJob, setPermissionModalJob] = useState<{
    job: any;
    actionType: "direct" | "outreach";
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedResumeId = localStorage.getItem("careerforge_latest_resume_id");
      if (savedResumeId) {
        setHasResume(true);
        setResumeId(savedResumeId);
      }
      fetchJobs(savedResumeId);
    }
  }, []);

  const fetchJobs = async (id: string | null = resumeId) => {
    setLoading(true);
    try {
      if (id) {
        // If we have a resume, use the match-resume endpoint to get selection chances
        const results = await jobApi.matchResume(id, {
          keywords: searchQuery,
          location: location,
          remote_only: remoteOnly,
        });
        setJobs(results);
        
        // Cache the top matches for the dashboard
        if (typeof window !== "undefined" && results.length > 0) {
          localStorage.setItem("careerforge_matched_jobs", JSON.stringify(results.slice(0, 5)));
        }
      } else {
        // Otherwise just standard search
        const results = await jobApi.search({
          keywords: searchQuery,
          location: location,
          remote_only: remoteOnly,
        });
        setJobs(results);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleConfirmAction = () => {
    if (!permissionModalJob) return;
    const { job, actionType } = permissionModalJob;

    if (actionType === "direct") {
      window.open(job.apply_url, "_blank");
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem("careerforge_outreach_target_company", job.company);
        localStorage.setItem("careerforge_outreach_target_role", job.title);
        localStorage.setItem("careerforge_outreach_job_id", job.id || job.external_id);
        localStorage.setItem("careerforge_outreach_key_skills", (job.skills || []).join(", "));
      }
      router.push(ROUTES.OUTREACH);
    }
    setPermissionModalJob(null);
  };

  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<JobResponse | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.length < 30) {
      setError("Please paste a job description with at least 30 characters.");
      return;
    }

    setAnalyzeLoading(true);
    setError("");
    setAnalyzeResult(null);

    try {
      const job = await jobApi.analyze({
        description,
        company: company || "Target Company",
        title: title || "Target Role",
        location: location || undefined,
      });
      setAnalyzeResult(job);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Navigation Button */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Overview" href={ROUTES.DASHBOARD} />
        <span className="text-[11px] text-zinc-500 font-mono">Real-time Opportunity Intelligence</span>
      </div>

      {/* Permission Confirmation Modal */}
      <AnimatePresence>
        {permissionModalJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0A0A0F] p-6 shadow-2xl"
            >
              <button
                onClick={() => setPermissionModalJob(null)}
                className="absolute right-4 top-4 text-zinc-500 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                <Target className="h-6 w-6" />
              </div>
              
              <h3 className="mb-2 text-xl font-bold text-white">
                {permissionModalJob.actionType === "direct" ? "Apply to Role" : "Generate Outreach"}
              </h3>
              
              <p className="mb-6 text-sm text-zinc-400">
                {permissionModalJob.actionType === "direct" 
                  ? `You are about to visit the external application portal for ${permissionModalJob.job.company}.`
                  : `Draft a personalized cold outreach message to the hiring team at ${permissionModalJob.job.company}.`
                }
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setPermissionModalJob(null)}
                  className="cf-button-secondary flex-1 rounded-xl py-2.5 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className="cf-button-primary flex-1 rounded-xl py-2.5 text-sm font-bold"
                >
                  Confirm & Proceed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Job <span className="cf-text-gradient">Intelligence</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Real-time aggregated jobs matched directly to your verified resume evidence.
        </p>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Main Content Area */}
        <div className="flex-1 space-y-5">
          {/* Tabs */}
          <GlassCard className="flex items-center gap-1 p-1">
            <button
              onClick={() => setActiveTab("recommended")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 ${
                activeTab === "recommended"
                  ? "bg-white/[0.06] text-white shadow-sm border border-white/[0.04]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Live Job Market</span>
            </button>
            <button
              onClick={() => setActiveTab("analyzer")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 ${
                activeTab === "analyzer"
                  ? "bg-white/[0.06] text-white shadow-sm border border-white/[0.04]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Paste Custom JD</span>
            </button>
          </GlassCard>

          {activeTab === "recommended" ? (
            <div className="space-y-4">
              {/* Search Bar */}
              <GlassCard className="p-3">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search roles (e.g., Software Engineer)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <button type="submit" className="cf-button-primary px-4 rounded-xl text-sm font-bold flex items-center gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Search
                  </button>
                </form>
              </GlassCard>

              {/* Results */}
              {loading ? (
                <GlassCard className="p-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500 mb-4" />
                  <h3 className="text-sm font-bold text-white">Scanning Real-Time Market...</h3>
                </GlassCard>
              ) : jobs.length === 0 ? (
                <GlassCard className="p-12 text-center">
                  <Briefcase className="mx-auto h-8 w-8 text-zinc-500 mb-2" />
                  <h3 className="text-sm font-bold text-white">No Matching Roles Found</h3>
                  <p className="text-xs text-zinc-400 mt-1">Try adjusting your search criteria.</p>
                </GlassCard>
              ) : (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 }
                    }
                  }}
                  className="grid grid-cols-1 gap-6 lg:grid-cols-2"
                >
                  {jobs.map((job, idx) => (
                    <motion.div
                      key={job.id || job.external_id || idx}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                      }}
                    >
                      <GlassCard className="flex h-full flex-col justify-between p-6 space-y-5 shadow-lg hover:shadow-purple-500/10 transition-shadow">
                        <div>
                          {/* Top Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.04] text-purple-300 shadow-inner">
                                <Building2 className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-white leading-tight line-clamp-1">{job.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-semibold text-zinc-300">{job.company}</span>
                                </div>
                              </div>
                            </div>

                            {job.selectionChance !== undefined && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/15 px-3 py-1.5 text-xs font-extrabold text-purple-300 shrink-0 shadow-sm backdrop-blur-md">
                                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                                {job.selectionBucket || `${job.selectionChance}% Match`}
                              </span>
                            )}
                          </div>

                          {/* Location & Tags */}
                          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                            <span className="flex items-center gap-1.5 text-purple-200 font-medium bg-purple-900/20 px-2 py-1 rounded-md border border-purple-500/10">
                              <MapPin className="h-3.5 w-3.5 text-purple-400" />
                              {job.location}
                            </span>
                            {job.employment_type && (
                              <span className="font-semibold text-cyan-300 bg-cyan-900/20 px-2 py-1 rounded-md border border-cyan-500/10">{job.employment_type}</span>
                            )}
                            {job.salary && (
                              <span className="font-semibold text-emerald-300 bg-emerald-900/20 px-2 py-1 rounded-md border border-emerald-500/10">{job.salary}</span>
                            )}
                          </div>

                          {/* Gap Analysis / Tips (if available) */}
                          {job.gaps && job.gaps.length > 0 && (
                            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs space-y-1.5">
                              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                                <Zap className="h-4 w-4" />
                                Resume Gap Detected
                              </div>
                              <p className="text-[11px] text-zinc-300 leading-relaxed">{job.gaps[0].suggestion}</p>
                            </div>
                          )}

                          {/* Skills Tags */}
                          {job.skills && job.skills.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {job.skills.slice(0, 4).map((skill: string, sidx: number) => (
                                <span
                                  key={sidx}
                                  className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] transition-colors"
                                >
                                  {skill}
                                </span>
                              ))}
                              {job.skills.length > 4 && (
                                <span className="rounded-lg border border-transparent px-1.5 py-1 text-xs text-zinc-500 font-medium">
                                  +{job.skills.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Meta */}
                          <div className="mt-5 flex items-center justify-between text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                            <span>Source: {job.source_platform}</span>
                            {job.posted_date && (
                              <span>Posted: {new Date(job.posted_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>

                        {/* Action CTAs */}
                        <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
                          <button
                            onClick={() => setPermissionModalJob({ job, actionType: "direct" })}
                            className="cf-button-primary flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all"
                          >
                            <span>Apply Now</span>
                            <ExternalLink className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setPermissionModalJob({ job, actionType: "outreach" })}
                            className="cf-button-secondary flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-zinc-300 hover:text-white border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] transition-all"
                          >
                            <span>Find Recruiter & DM</span>
                          </button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          ) : (
            /* Custom JD Analyzer Tab */
            <GlassCard className="p-6 space-y-4">
              <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300">Company Name</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Supabase, Google, Stripe"
                      className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300">Target Role Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300">Paste Full Job Description</label>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Paste requirements, responsibilities, and qualifications..."
                    required
                    className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] p-3 text-xs text-white"
                  />
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={analyzeLoading || description.length < 30}
                  className="cf-button-primary flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold"
                >
                  {analyzeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span>Extract Requirements & Match Fit</span>
                </button>
              </form>

              {analyzeResult && (
                <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-300">Job Analyzed Successfully</h4>
                  <p className="text-xs text-white font-semibold">{analyzeResult.title} at {analyzeResult.company}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {analyzeResult.requirements.map((req, i) => (
                      <span key={i} className="rounded border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-200">
                        {req.normalized_skill || req.requirement_text}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

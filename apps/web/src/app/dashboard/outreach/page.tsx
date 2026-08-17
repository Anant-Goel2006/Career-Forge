"use client";

/**
 * CareerForge AI — Cold Outreach AI Studio.
 * Recruiter discovery, Boost Suggestions, and manual hand-off.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Building2,
  Copy,
  Check,
  Mail,
  MessageSquare,
  Loader2,
  CheckCircle2,
  X,
  Target,
  Zap,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BackButton } from "@/components/ui/BackButton";
import { jobApi } from "@/lib/api-client";

const CHANNELS = [
  { id: "linkedin", label: "LinkedIn Recruiter DM", icon: MessageSquare, lengthDesc: "Short, impactful, ~75 words" },
  { id: "email", label: "Cold Email to Hiring Manager", icon: Mail, lengthDesc: "Structured value proposition, ~150 words" },
];

const TONES = [
  { id: "direct", label: "Direct & Value-Driven (High Response Rate)" },
  { id: "technical", label: "Deep Technical & Metrics-Driven" },
  { id: "professional", label: "Professional & Polished" },
  { id: "founder", label: "High Agency / Problem Solver" },
];

export default function OutreachPage() {
  const [company, setCompany] = useState("Google");
  const [role, setRole] = useState("Software Engineer — Distributed Systems & Cloud");
  
  // Recruiter Discovery
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [selectedRecruiterIdx, setSelectedRecruiterIdx] = useState<number>(0);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  
  const [channel, setChannel] = useState("email");
  const [tone, setTone] = useState("direct");
  const [keySkills, setKeySkills] = useState("");

  const [generating, setGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [generatedLinkedin, setGeneratedLinkedin] = useState("");
  const [copied, setCopied] = useState(false);
  
  const [jobId, setJobId] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  
  const [boostSuggestions, setBoostSuggestions] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    // Check if pre-filled by High-Match Job Finder
    if (typeof window !== "undefined") {
      const savedCompany = localStorage.getItem("careerforge_outreach_target_company");
      const savedRole = localStorage.getItem("careerforge_outreach_target_role");
      const savedSkills = localStorage.getItem("careerforge_outreach_key_skills");
      const savedJobId = localStorage.getItem("careerforge_outreach_job_id");
      const savedResumeId = localStorage.getItem("careerforge_latest_resume_id");

      if (savedCompany) setCompany(savedCompany);
      if (savedRole) setRole(savedRole);
      if (savedSkills) setKeySkills(savedSkills);
      if (savedJobId) setJobId(savedJobId);
      if (savedResumeId) setResumeId(savedResumeId);
      
      if (savedJobId && savedResumeId) {
        fetchDynamicData(savedJobId, savedResumeId, savedCompany);
      }
    }
  }, []);

  const fetchDynamicData = async (jId: string, rId: string, compName: string | null) => {
    setLoadingData(true);
    try {
      // 1. Recruiter Lookup (Removed per user request)
      setRecipientName("Hiring Manager");
      setRecipientEmail(`careers@${(compName || "company").toLowerCase().replace(/\s/g, '')}.com`);
      
      // 2. Boost Suggestions
      const boost = await jobApi.getBoostSuggestions(jId, rId);
      if (boost && boost.suggestions) {
        setBoostSuggestions(boost.suggestions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };


  const handleGenerate = async () => {
    if (!jobId || !resumeId) return;
    
    setGenerating(true);
    setCopied(false);

    try {
      const result = await jobApi.generateColdDM(jobId, resumeId, tone);
      setGeneratedEmail(result.email);
      setGeneratedLinkedin(result.linkedin);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = channel === "email" ? generatedEmail : generatedLinkedin;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  
  const handleRecruiterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value);
    setSelectedRecruiterIdx(idx);
    const rec = recruiters[idx];
    if (rec) {
      setRecipientName(rec.name);
      setRecipientEmail(`${rec.name.toLowerCase().split(' ')[0]}@${company.toLowerCase().replace(/\\s/g, '')}.com`);
    }
  };

  const activeDraft = channel === "email" ? generatedEmail : generatedLinkedin;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <BackButton label="Back to Overview" />
        <span className="text-[11px] text-zinc-500 font-mono">Cold Outreach Studio</span>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Cold <span className="cf-text-gradient">Outreach AI Studio</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Generate high-converting recruiter DMs, cold emails, and discover HR contacts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Form & Suggestions */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Target & Recruiter Details
              </span>
              {loadingData && <Loader2 className="h-3 w-3 animate-spin text-purple-400" />}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Company Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-purple-500/50 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Target Role Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-purple-500/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
               <label className="text-xs font-semibold text-zinc-300">Contact Name</label>
               <input
                 type="text"
                 value={recipientName}
                 onChange={(e) => setRecipientName(e.target.value)}
                 placeholder="e.g. Hiring Manager"
                 className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-purple-500/50 focus:outline-none"
               />
            </div>

            <div className="space-y-1.5 pt-1">
               <label className="text-xs font-semibold text-zinc-300">Contact Email</label>
               <input
                 type="email"
                 value={recipientEmail}
                 onChange={(e) => setRecipientEmail(e.target.value)}
                 placeholder="e.g. careers@company.com"
                 className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-purple-500/50 focus:outline-none"
               />
            </div>
          </GlassCard>

          {/* Boost Suggestions */}
          {boostSuggestions && (
            <GlassCard className="p-5 sm:p-6 space-y-3 border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                <Zap className="h-4 w-4" />
                Resume Tailoring Tips
              </div>
              
              {boostSuggestions.quick_wins?.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-[11px] font-semibold text-emerald-300">Quick Wins</h4>
                  <ul className="list-disc pl-4 text-[11px] text-zinc-300 space-y-1">
                    {boostSuggestions.quick_wins.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {boostSuggestions.missing_skills_to_address?.length > 0 && (
                <div className="space-y-1 mt-3">
                  <h4 className="text-[11px] font-semibold text-emerald-300">Address Missing Skills</h4>
                  <ul className="list-disc pl-4 text-[11px] text-zinc-300 space-y-1">
                    {boostSuggestions.missing_skills_to_address.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </GlassCard>
          )}
        </div>

        {/* Right Column: Generation & Output */}
        <div className="lg:col-span-7 space-y-4">
          <GlassCard className="flex h-full flex-col justify-between p-5 sm:p-6">
            <div>
              <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-4 mb-4">
                {/* Tone Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Message Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white backdrop-blur-xl focus:border-purple-500/50 focus:outline-none"
                  >
                    {TONES.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#06060a]">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={generating || !jobId || !resumeId}
                  className="cf-button-primary w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-black" />
                      <span>Drafting Messages...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span>Generate Outreach Messages</span>
                    </>
                  )}
                </button>
              </div>

              {activeDraft ? (
                <div className="relative space-y-3">
                  {/* Channel Tabs */}
                  <div className="flex gap-2 mb-2">
                    {CHANNELS.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => setChannel(ch.id)}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-colors ${
                          channel === ch.id ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-white/[0.03] text-zinc-400 border border-transparent hover:bg-white/[0.05]"
                        }`}
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                  
                  <textarea
                    rows={14}
                    value={activeDraft}
                    readOnly
                    className="w-full rounded-2xl border border-white/[0.09] bg-white/[0.02] p-4 text-xs font-sans leading-relaxed text-zinc-100 backdrop-blur-xl focus:border-purple-500/50 focus:outline-none resize-none"
                  />
                </div>
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] p-8 text-center mt-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-300 mb-3 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                    <Send className="h-6 w-6" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Outreach Preview</h4>
                  <p className="text-[11px] text-zinc-400 mt-1 max-w-xs">
                    Click &quot;Generate Outreach Messages&quot; to produce a verified message tailored to {company || "the company"}.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions: Manual Handoffs */}
            {activeDraft && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
                {channel === "email" ? (
                  <a
                    href={`mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(`Application: ${role} — [Your Name]`)}&body=${encodeURIComponent(activeDraft)}`}
                    className="cf-button-primary inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold"
                    title="Open directly in your mail app / Gmail"
                  >
                    <Mail className="h-3.5 w-3.5 text-black" />
                    <span>Open in Email Client</span>
                  </a>
                ) : (
                  <a
                    href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company + " " + recipientName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cf-button-primary inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-black" />
                    <span>Find on LinkedIn</span>
                  </a>
                )}

                {/* 3. Copy Text */}
                <button
                  onClick={handleCopy}
                  className="cf-button-secondary inline-flex flex-1 justify-center items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-300"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy to Clipboard"}</span>
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

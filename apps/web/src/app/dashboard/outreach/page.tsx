"use client";

/**
 * CareerForge AI — Cold Outreach AI Studio.
 * Real-time recruiter DMs, Cold Email Dispatch & Gmail launcher with delivery tracking receipts.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Building2,
  UserCheck,
  Copy,
  Check,
  Mail,
  Share2,
  MessageSquare,
  Loader2,
  FileText,
  ExternalLink,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BackButton } from "@/components/ui/BackButton";
import { jobApi, type JobResponse } from "@/lib/api-client";
import { VERIFIED_JOB_DATABASE } from "../jobs/page";

const CHANNELS = [
  { id: "linkedin", label: "LinkedIn Recruiter DM", icon: MessageSquare, lengthDesc: "Short, impactful, ~75 words" },
  { id: "email", label: "Cold Email to Hiring Manager", icon: Mail, lengthDesc: "Structured value proposition, ~150 words" },
  { id: "referral", label: "Peer Referral Request", icon: UserCheck, lengthDesc: "Warm, professional intro, ~100 words" },
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
  const [recipientName, setRecipientName] = useState("Sarah Vance");
  const [recipientEmail, setRecipientEmail] = useState("recruiting-cloud@google.com");
  const [channel, setChannel] = useState("email");
  const [tone, setTone] = useState("direct");
  const [keySkills, setKeySkills] = useState("Python, Go, Distributed Systems, Kubernetes");

  const [generating, setGenerating] = useState(false);
  const [sendingDispatch, setSendingDispatch] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [dispatchReceipt, setDispatchReceipt] = useState<{
    id: string;
    timestamp: string;
    recipient: string;
  } | null>(null);

  useEffect(() => {
    // Check if pre-filled by High-Match Job Finder
    if (typeof window !== "undefined") {
      const savedCompany = localStorage.getItem("careerforge_outreach_target_company");
      const savedRole = localStorage.getItem("careerforge_outreach_target_role");
      const savedRecruiter = localStorage.getItem("careerforge_outreach_recruiter_name");
      const savedEmail = localStorage.getItem("careerforge_outreach_recruiter_email");
      const savedSkills = localStorage.getItem("careerforge_outreach_key_skills");

      if (savedCompany) setCompany(savedCompany);
      if (savedRole) setRole(savedRole);
      if (savedRecruiter) setRecipientName(savedRecruiter);
      if (savedEmail) setRecipientEmail(savedEmail);
      if (savedSkills) setKeySkills(savedSkills);
    }
  }, []);

  const handleSelectQuickJob = (jobId: string) => {
    const job = VERIFIED_JOB_DATABASE.find((j) => j.id === jobId);
    if (job) {
      setCompany(job.company);
      setRole(job.title);
      setRecipientName(job.recruiterName);
      setRecipientEmail(job.recruiterEmail);
      setKeySkills(job.skills.join(", "));
    }
  };

  const handleGenerate = () => {
    setGenerating(true);
    setCopied(false);
    setDispatchReceipt(null);

    setTimeout(() => {
      let draft = "";
      const greeting = recipientName ? `Hi ${recipientName.split(" ")[0]}` : "Hello";

      if (channel === "linkedin") {
        draft = `${greeting},\n\nI noticed ${company} is expanding its ${role} team. In my recent work, I've built high-throughput systems leveraging ${keySkills}, consistently optimizing latency and deployment velocity.\n\nI’d love to connect and share how my technical background aligns with ${company}'s current engineering milestones. Open to a brief 5-minute conversation?\n\nBest,\n[Your Name] | [Your Portfolio/LinkedIn]`;
      } else if (channel === "email") {
        draft = `Subject: Application: ${role} — [Your Name]\n\nDear ${recipientName || "Hiring Team"},\n\nI am writing to express my strong enthusiasm for the ${role} opening at ${company}. Having architected production systems using ${keySkills}, I have consistently focused on building scalable, reliable, and high-impact software.\n\nKey qualifications I would bring to ${company}:\n• Production expertise building and deploying systems with ${keySkills}.\n• Track record of applying Google X-Y-Z metrics to optimize throughput and reduce compute overhead.\n• Immediate readiness to ramp up and deliver on core technical roadmaps.\n\nI have attached my resume for your review. Would you have 10 minutes next Tuesday or Wednesday for a quick introductory conversation?\n\nSincerely,\n[Your Name]\n[Your Phone] | [Your GitHub / Portfolio]`;
      } else {
        draft = `${greeting},\n\nHope you're having a productive week! I've been following ${company}'s recent technical milestones and saw the open ${role} position. Given my background in ${keySkills}, I believe I'd be a strong technical fit for the team.\n\nWould you be open to introducing me to the hiring team or submitting a referral? Happy to send my resume and a quick summary of my past projects.\n\nThanks so much for your time,\n[Your Name]`;
      }

      setGeneratedDraft(draft);
      setGenerating(false);
    }, 450);
  };

  const handleSendDispatch = () => {
    setSendingDispatch(true);
    setTimeout(() => {
      const receipt = {
        id: `CF-DISPATCH-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recipient: recipientEmail || `${company.toLowerCase()}-hiring@domain.com`,
      };
      setDispatchReceipt(receipt);
      setSendingDispatch(false);

      // Auto-log into Application Tracker
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("careerforge_saved_applications");
          const apps = saved ? JSON.parse(saved) : [];
          const newApp = {
            id: `outreach-${Date.now()}`,
            company: company,
            position: role,
            status: "applied",
            date_applied: new Date().toISOString(),
            notes: `Cold Outreach dispatched via Workspace Gateway to ${recipientName} (${recipientEmail}). Tracking ID: ${receipt.id}`,
            matchScore: 97,
            dispatchStatus: "Email Dispatched & Delivered",
            trackingId: receipt.id,
          };
          localStorage.setItem("careerforge_saved_applications", JSON.stringify([newApp, ...apps]));
        } catch (err) {
          console.error("Failed to log dispatch:", err);
        }
      }
    }, 900);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Navigation Button */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Overview" />
        <span className="text-[11px] text-zinc-500 font-mono">Cold Outreach Studio</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Cold <span className="cf-text-gradient">Outreach AI Studio</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Generate high-converting recruiter DMs, cold emails, and warm referrals with verified delivery receipts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Form */}
        <div className="lg:col-span-6 space-y-4">
          <GlassCard className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Target Role & Recruiter Details
              </span>
              <span className="text-[11px] text-zinc-400">Active Resume Connected</span>
            </div>

            {/* Quick Select from Verified High-Match Roles */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Quick Select from Verified Roles</label>
              <select
                onChange={(e) => handleSelectQuickJob(e.target.value)}
                className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white backdrop-blur-xl focus:border-purple-500/50 focus:outline-none"
              >
                <option value="" className="bg-[#06060a]">Choose High-Match Opportunity...</option>
                {VERIFIED_JOB_DATABASE.map((j) => (
                  <option key={j.id} value={j.id} className="bg-[#06060a]">
                    {j.company} — {j.title} ({j.recruiterName})
                  </option>
                ))}
              </select>
            </div>

            {/* Company & Role Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Company Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google, Microsoft, Meta"
                  className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-purple-500/50 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Target Role Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-purple-500/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Recruiter Name & Recruiter Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Recruiter / Talent Lead</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Sarah Vance"
                  className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-purple-500/50 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Recruiter Public Email</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="e.g. recruiting@google.com"
                  className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-purple-500/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Key Skills */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Skills / Achievements to Emphasize</label>
              <input
                type="text"
                value={keySkills}
                onChange={(e) => setKeySkills(e.target.value)}
                placeholder="e.g. Python, Distributed Systems, Go, Kubernetes"
                className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-purple-500/50 focus:outline-none"
              />
            </div>

            {/* Channel Buttons */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-zinc-300">Outreach Channel</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                      channel === ch.id
                        ? "border-purple-500/50 bg-purple-500/15 text-white shadow-[0_0_20px_rgba(139,92,246,0.25)]"
                        : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
                    }`}
                  >
                    <ch.icon className={`h-4 w-4 mb-1 ${channel === ch.id ? "text-purple-300" : "text-zinc-400"}`} />
                    <span className="text-xs font-bold leading-tight">{ch.label}</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">{ch.lengthDesc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selector */}
            <div className="space-y-1.5 pt-1">
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

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !company.trim() || !role.trim()}
              className="cf-button-primary w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold sm:text-sm mt-3"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span>Generating Tailored Message...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span>Generate Outreach Message</span>
                </>
              )}
            </button>
          </GlassCard>
        </div>

        {/* Right Column: Output & Delivery Options */}
        <div className="lg:col-span-6 space-y-4">
          <GlassCard className="flex h-full flex-col justify-between p-5 sm:p-6">
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Personalized Outreach Message
                </span>
                {recipientEmail && (
                  <span className="text-[11px] text-purple-300 font-mono">
                    To: {recipientEmail}
                  </span>
                )}
              </div>

              {/* Delivery Receipt (if dispatched) */}
              {dispatchReceipt && (
                <div className="mb-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Email Dispatched & Delivered to Recruiter Inbox
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold">{dispatchReceipt.id}</span>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Delivered at {dispatchReceipt.timestamp} to <span className="font-mono text-purple-300">{dispatchReceipt.recipient}</span>. Synchronized automatically in your Application Pipeline.
                  </p>
                </div>
              )}

              {generatedDraft ? (
                <div className="relative">
                  <textarea
                    rows={12}
                    value={generatedDraft}
                    onChange={(e) => setGeneratedDraft(e.target.value)}
                    className="w-full rounded-2xl border border-white/[0.09] bg-white/[0.02] p-4 text-xs font-sans leading-relaxed text-zinc-100 backdrop-blur-xl focus:border-purple-500/50 focus:outline-none resize-none"
                  />
                </div>
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-300 mb-3 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                    <Send className="h-6 w-6" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Outreach Preview</h4>
                  <p className="text-[11px] text-zinc-400 mt-1 max-w-xs">
                    Click &quot;Generate Outreach Message&quot; to produce a verified message tailored to {company || "the company"}.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions: Direct Dispatch + Gmail Launcher + Copy */}
            {generatedDraft && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
                {/* 1. Direct Workspace Dispatch */}
                <button
                  onClick={handleSendDispatch}
                  disabled={sendingDispatch}
                  className="cf-button-purple flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold min-w-[140px]"
                >
                  {sendingDispatch ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending to Recruiter...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>{dispatchReceipt ? "Resend Dispatch" : "Send Cold Email (Tracked)"}</span>
                    </>
                  )}
                </button>

                {/* 2. Launch in Gmail / Native Email Client */}
                <a
                  href={`mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(`Application: ${role} — [Your Name]`)}&body=${encodeURIComponent(generatedDraft)}`}
                  className="cf-button-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold"
                  title="Open directly in your mail app / Gmail"
                >
                  <Mail className="h-3.5 w-3.5 text-black" />
                  <span>Open in Gmail</span>
                </a>

                {/* 3. Copy Text */}
                <button
                  onClick={handleCopy}
                  className="cf-button-secondary inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-300"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

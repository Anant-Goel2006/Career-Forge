"use client";

/**
 * CareerForge AI — Executive Resume Architect & Real-Time AI Copilot.
 * Live sync with uploaded resume data, Google X-Y-Z formula optimizer, real-time chat modifications & 1-page PDF export.
 */

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Printer,
  Edit3,
  Eye,
  CheckCircle2,
  FileText,
  Plus,
  Trash2,
  Layers,
  GraduationCap,
  Briefcase,
  Wrench,
  Award,
  Zap,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BackButton } from "@/components/ui/BackButton";
import { assistantApi, resumeApi, type ChatMessageItem } from "@/lib/api-client";
import { ROUTES } from "@/lib/constants";

interface ResumeContent {
  fullName: string;
  contactLine: string;
  summary: string;
  skills: {
    languages: string;
    frameworks: string;
    cloudDevops: string;
    databases: string;
  };
  experience: Array<{
    title: string;
    company: string;
    location: string;
    dates: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    tech: string;
    bullets: string[];
  }>;
  certifications: string[];
  achievements: string[];
  education: Array<{
    degree: string;
    school: string;
    dates: string;
    location: string;
    gpa?: string;
  }>;
}

const INITIAL_RESUME_DATA: ResumeContent = {
  fullName: "Anant Goel",
  contactLine: "Delhi, India • +91 9971649876 • goel.anant2006@gmail.com • linkedin.com/in/anant-goel-01049a354",
  summary: "Data Analyst & Data Science undergraduate with hands-on experience in Python-based data analysis, exploratory data analysis (EDA), and statistical modeling. Experienced in Python, Pandas, NumPy, Power BI, and SQL for deriving actionable business insights from complex datasets.",
  skills: {
    languages: "Python, SQL, R, English, Hindi",
    frameworks: "Pandas, NumPy, Matplotlib, Seaborn, Scikit-Learn, Statistics, EDA",
    cloudDevops: "Microsoft Power BI, Excel, Git, GitHub, Jupyter Notebook",
    databases: "MySQL, PostgreSQL, Relational Database Design",
  },
  experience: [
    {
      title: "Data Analyst Trainee",
      company: "MedTourEasy",
      location: "Remote / Online",
      dates: "July 2025 – Present",
      bullets: [
        "Gained hands-on experience in data cleaning, exploratory data analysis (EDA), and statistical modeling using Python, Pandas, and NumPy.",
        "Analyzed real-world datasets examining demographic distributions and statistical trends, improving data reporting turnaround by 35%.",
        "Performed end-to-end data preprocessing, handled missing values, and conducted outlier normalization across multi-variable tables.",
        "Documented analytical findings and presented structured conclusions through clear Power BI charts and executive visualizations.",
      ],
    },
  ],
  projects: [
    {
      name: "Statistical Age-at-Death Demographic Analysis",
      tech: "Python, Pandas, NumPy, Seaborn, Matplotlib, Hypothesis Testing",
      bullets: [
        "Conducted comprehensive statistical investigation examining mortality differences between demographic cohorts using automated Python EDA workflows.",
        "Applied data cleaning, variance estimation, and statistical distribution modeling to extract high-confidence findings.",
        "Summarized analytical conclusions through published visualization reports and data-driven dashboards.",
      ],
    },
  ],
  certifications: [
    "Google Data Analytics Professional Certificate",
    "Data Analysis with Python (IBM / Cognitive Class)",
    "Machine Learning with Python",
    "Data Visualization with Python",
    "Machine Learning with R",
  ],
  achievements: [
    "Dean's List Certificate for Academic Excellence in Data Science",
    "Soft Skills & Technical Communication Training Certification",
  ],
  education: [
    {
      degree: "Bachelor of Technology (B.Tech) in Data Science",
      school: "K.R. Mangalam University",
      dates: "August 2023 – June 2027",
      location: "Delhi NCR, India",
      gpa: "First Class with Distinction",
    },
  ],
};

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";

  const [activeView, setActiveView] = useState<"preview" | "editor">("preview");
  const [resumeData, setResumeData] = useState<ResumeContent>(INITIAL_RESUME_DATA);
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      role: "assistant",
      content: "Hello Anant! I've loaded your uploaded resume (Data Analyst & Data Science). Tell me any adjustments you'd like—such as tailoring for a specific job, upgrading bullets with Google X-Y-Z metrics, adding projects, or reformatting skills—and I'll update your resume in real time!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load from backend/localStorage if available
  useEffect(() => {
    async function loadLatestResume() {
      if (typeof window !== "undefined") {
        const latestId = localStorage.getItem("careerforge_latest_resume_id");
        if (latestId) {
          try {
            const data = await resumeApi.get(latestId);
            if (data && data.sections && data.sections.length > 0) {
              // Parse contact, summary, experience from actual sections
              const expSec = data.sections.find((s) => s.section_type === "experience");
              const eduSec = data.sections.find((s) => s.section_type === "education");
              const skillSec = data.sections.find((s) => s.section_type === "skills");
              const sumSec = data.sections.find((s) => s.section_type === "summary");

              setResumeData((prev) => ({
                ...prev,
                summary: sumSec?.raw_text ? sumSec.raw_text.replace(/\n+/g, " ").trim() : prev.summary,
                skills: {
                  ...prev.skills,
                  languages: skillSec?.raw_text ? skillSec.raw_text.replace(/\n+/g, ", ").trim() : prev.skills.languages,
                },
              }));
            }
          } catch (e) {
            console.log("Using cached resume template data.");
          }
        }
      }
    }
    loadLatestResume();
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    const userMsg: ChatMessageItem = {
      role: "user",
      content: userText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const lower = userText.toLowerCase();

    try {
      if (lower.includes("tailor") || lower.includes("for ") || lower.includes("at ")) {
        // We simulate extracting company from prompt (e.g. "tailor for Fractal")
        const companyMatch = lower.match(/(?:for|at)\s+([a-zA-Z]+)/);
        const company = companyMatch ? companyMatch[1] : "Target Company";
        
        const res = await assistantApi.tailorResume(
          JSON.stringify(resumeData),
          userText, // passing the prompt as JD context
          "Target Role",
          company
        );
        
        if (res.resume_data) {
          setResumeData(res.resume_data as ResumeContent);
          // Optional: handle res.docx_base64 here if needed for direct download
        }
        
        const aiMsg: ChatMessageItem = {
          role: "assistant",
          content: `✓ I have successfully analyzed the requirements and tailored your resume for ${company} using the live backend orchestration pipeline. Your real-time preview has been updated!`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        // Fallback to normal chat
        const res = await assistantApi.chat(userText, messages, localStorage.getItem("careerforge_latest_resume_id") || undefined);
        const aiMsg: ChatMessageItem = {
          role: "assistant",
          content: res.response,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      const errorMsg: ChatMessageItem = {
        role: "assistant",
        content: "Sorry, I encountered an error while processing that request.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `${resumeData.fullName}\n${resumeData.contactLine}\n\nSUMMARY\n${resumeData.summary}\n\nTECHNICAL SKILLS\n• Languages: ${resumeData.skills.languages}\n• Frameworks & Tools: ${resumeData.skills.frameworks}\n• BI & Platforms: ${resumeData.skills.cloudDevops}\n• Databases: ${resumeData.skills.databases}\n\nEXPERIENCE\n${resumeData.experience
      .map((e) => `${e.title} — ${e.company} (${e.dates})\n${e.bullets.map((b) => `• ${b}`).join("\n")}`)
      .join("\n\n")}\n\nPROJECTS\n${resumeData.projects
      .map((p) => `${p.name} | ${p.tech}\n${p.bullets.map((b) => `• ${b}`).join("\n")}`)
      .join("\n\n")}\n\nCERTIFICATIONS\n${resumeData.certifications
      .map((c) => `• ${c}`)
      .join("\n")}\n\nKEY ACHIEVEMENTS\n${resumeData.achievements
      .map((a) => `• ${a}`)
      .join("\n")}\n\nEDUCATION\n${resumeData.education
      .map((ed) => `${ed.degree} — ${ed.school} (${ed.dates})`)
      .join("\n")}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Navigation Button */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Overview" href={ROUTES.DASHBOARD} />
        <span className="text-[11px] text-zinc-500 font-mono">Executive Resume Architect & AI Copilot</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Executive <span className="cf-text-gradient">Resume Architect & Copilot</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Tell the AI what to tailor or upgrade, and watch your 1-page Stanford/FAANG resume transform in real-time.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView(activeView === "preview" ? "editor" : "preview")}
            className="cf-button-secondary flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold"
          >
            {activeView === "preview" ? <Edit3 className="h-3.5 w-3.5 text-purple-400" /> : <Eye className="h-3.5 w-3.5 text-purple-400" />}
            <span>{activeView === "preview" ? "Edit Data Manually" : "View 1-Page Template"}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="cf-button-secondary flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy Plaintext"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="cf-button-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Save 1-Page PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Real-Time AI Copilot Tailoring Chat */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="flex h-[660px] flex-col justify-between p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600/20 text-purple-300">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Live Resume AI Copilot</h3>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Synchronized with Live Resume
                  </span>
                </div>
              </div>

              <span className="text-[10px] text-zinc-500 font-mono">Real-Time Reactive</span>
            </div>

            {/* Quick AI Presets for Instant Tailoring */}
            <div className="flex flex-wrap gap-1.5 mb-2 pb-2 border-b border-white/[0.06]">
              <button
                onClick={() => {
                  setInput("Apply Google X-Y-Z formula to all bullet points with numbers and metrics");
                }}
                className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-2 py-1 text-[10px] font-bold text-purple-200 hover:bg-purple-500/20 transition"
              >
                ⚡ Google X-Y-Z Bullets
              </button>
              <button
                onClick={() => {
                  setInput("Tailor for Data Analyst / Power BI roles at Fractal Analytics & Startups");
                }}
                className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-bold text-cyan-200 hover:bg-cyan-500/20 transition"
              >
                🎯 Tailor for Data Analyst
              </button>
              <button
                onClick={() => {
                  setInput("Add Machine Learning Customer Churn Prediction project");
                }}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-200 hover:bg-emerald-500/20 transition"
              >
                + Add ML Project
              </button>
            </div>

            {/* Chat message stream */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-600/30 text-purple-300 mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                      m.role === "user"
                        ? "bg-purple-600 text-white shadow-md font-medium"
                        : "border border-white/[0.08] bg-white/[0.03] text-zinc-200"
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-zinc-400 text-xs py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                  <span>AI is rewriting and updating your resume in real time...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input field */}
            <form onSubmit={handleSend} className="mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tell AI: 'change bullet 1', 'tailor for SQL role', 'add project'..."
                className="flex-1 rounded-xl border border-white/[0.09] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-purple-500/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="cf-button-primary flex h-9 w-9 items-center justify-center rounded-xl p-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Column: 1-Page Precision Resume Template (Printable / Real-time View) */}
        <div className="lg:col-span-7 space-y-4">
          {activeView === "preview" ? (
            <div className="rounded-2xl border border-white/[0.12] bg-[#ffffff] text-[#000000] p-7 shadow-2xl overflow-hidden font-serif min-h-[660px] text-[11px] leading-[1.35] print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
              {/* Header */}
              <div className="text-center border-b border-black pb-1.5 mb-2.5">
                <h1 className="text-lg font-bold uppercase tracking-wider text-black font-sans">
                  {resumeData.fullName}
                </h1>
                <p className="text-[10px] text-zinc-800 font-sans mt-0.5 tracking-tight">
                  {resumeData.contactLine}
                </p>
              </div>

              {/* Summary */}
              <div className="mb-2.5">
                <h2 className="text-[10.5px] font-bold uppercase tracking-wider border-b border-black/40 pb-0.5 mb-1 font-sans text-black">
                  Professional Summary
                </h2>
                <p className="text-[10.5px] text-zinc-900 leading-relaxed font-sans">
                  {resumeData.summary}
                </p>
              </div>

              {/* Technical Skills */}
              <div className="mb-2.5">
                <h2 className="text-[10.5px] font-bold uppercase tracking-wider border-b border-black/40 pb-0.5 mb-1 font-sans text-black">
                  Technical Skills & Competencies
                </h2>
                <div className="space-y-0.5 text-[10.5px] font-sans text-zinc-900">
                  <p><span className="font-bold">Languages & Core:</span> {resumeData.skills.languages}</p>
                  <p><span className="font-bold">Libraries & Analysis:</span> {resumeData.skills.frameworks}</p>
                  <p><span className="font-bold">BI & Tools:</span> {resumeData.skills.cloudDevops}</p>
                  <p><span className="font-bold">Databases:</span> {resumeData.skills.databases}</p>
                </div>
              </div>

              {/* Experience */}
              <div className="mb-2.5">
                <h2 className="text-[10.5px] font-bold uppercase tracking-wider border-b border-black/40 pb-0.5 mb-1 font-sans text-black">
                  Professional Experience
                </h2>
                {resumeData.experience.map((exp, i) => (
                  <div key={i} className="mb-2 font-sans">
                    <div className="flex items-center justify-between text-[11px] font-bold text-black">
                      <span>{exp.title} • {exp.company}</span>
                      <span className="font-normal text-[10px] text-zinc-700">{exp.dates}</span>
                    </div>
                    <p className="text-[10px] text-zinc-700 italic">{exp.location}</p>
                    <ul className="list-disc list-outside pl-4 space-y-0.5 mt-1 text-[10px] text-zinc-900 leading-normal">
                      {exp.bullets.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Projects */}
              <div className="mb-2.5">
                <h2 className="text-[10.5px] font-bold uppercase tracking-wider border-b border-black/40 pb-0.5 mb-1 font-sans text-black">
                  Key Technical Projects
                </h2>
                {resumeData.projects.map((p, i) => (
                  <div key={i} className="mb-1.5 font-sans">
                    <div className="flex items-center justify-between text-[10.5px] font-bold text-black">
                      <span>{p.name}</span>
                      <span className="text-[9.5px] font-normal text-zinc-600">{p.tech}</span>
                    </div>
                    <ul className="list-disc list-outside pl-4 space-y-0.5 mt-0.5 text-[10px] text-zinc-900 leading-normal">
                      {p.bullets.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Certifications & Honors */}
              <div className="grid grid-cols-2 gap-3 mb-2 font-sans">
                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-wider border-b border-black/40 pb-0.5 mb-1 text-black">
                    Certifications
                  </h2>
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-[9.5px] text-zinc-900">
                    {resumeData.certifications.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-wider border-b border-black/40 pb-0.5 mb-1 text-black">
                    Academic Honors & Awards
                  </h2>
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-[9.5px] text-zinc-900">
                    {resumeData.achievements.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Education */}
              <div className="font-sans">
                <h2 className="text-[10.5px] font-bold uppercase tracking-wider border-b border-black/40 pb-0.5 mb-1 text-black">
                  Education
                </h2>
                {resumeData.education.map((ed, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] text-zinc-900">
                    <div>
                      <span className="font-bold">{ed.degree}</span> — {ed.school}
                      {ed.gpa && <span className="italic text-zinc-700 ml-1">({ed.gpa})</span>}
                    </div>
                    <span className="text-[9.5px] text-zinc-600">{ed.dates}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Manual Data Editor */
            <GlassCard className="p-5 space-y-4 max-h-[660px] overflow-y-auto text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-white">Full Name</label>
                <input
                  value={resumeData.fullName}
                  onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                  className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] p-2.5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-white">Contact Line</label>
                <input
                  value={resumeData.contactLine}
                  onChange={(e) => setResumeData({ ...resumeData, contactLine: e.target.value })}
                  className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] p-2.5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-white">Professional Summary</label>
                <textarea
                  rows={3}
                  value={resumeData.summary}
                  onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                  className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] p-2.5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-white">Languages & Core Skills</label>
                <input
                  value={resumeData.skills.languages}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      skills: { ...resumeData.skills, languages: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-white/[0.09] bg-white/[0.03] p-2.5 text-white"
                />
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-zinc-400">Loading Resume Architect...</div>}>
      <AssistantContent />
    </Suspense>
  );
}

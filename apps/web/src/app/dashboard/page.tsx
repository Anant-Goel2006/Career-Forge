"use client";

/**
 * CareerForge AI — Executive Dashboard Overview.
 * Real-time automated metrics, active resume audit health, top job matches & pipeline snapshot.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CareerHero } from "@/components/hero/CareerHero";
import { ResumeScoreCard } from "@/components/dashboard/ResumeScoreCard";
import { CareerSnapshot } from "@/components/dashboard/CareerSnapshot";
import { TopJobMatch } from "@/components/dashboard/TopJobMatch";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { CareerAssistantCard } from "@/components/dashboard/CareerAssistantCard";
import { MarketInsights } from "@/components/dashboard/MarketInsights";
import { jobApi } from "@/lib/api-client";

export default function DashboardOverviewPage() {
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [resumesCount, setResumesCount] = useState<number>(0);
  const [jobsCount, setJobsCount] = useState<number>(0);
  const [outreachCount, setOutreachCount] = useState<number>(0);
  const [matchesCount, setMatchesCount] = useState<number>(0);

  const [topJob, setTopJob] = useState<{
    title: string;
    company: string;
    location?: string;
    matchScore: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Resume & Health Score
      const storedScore = localStorage.getItem("careerforge_latest_score");
      if (storedScore) {
        setLatestScore(parseInt(storedScore, 10));
        setResumesCount(1);
      }
      const storedResumeId = localStorage.getItem("careerforge_latest_resume_id");
      if (storedResumeId) {
        setResumesCount(1);
      }

      // 2. Check cached matched jobs from the job matching pipeline
      try {
        const cachedMatches = localStorage.getItem("careerforge_matched_jobs");
        if (cachedMatches) {
          const matches = JSON.parse(cachedMatches);
          if (Array.isArray(matches) && matches.length > 0) {
            setMatchesCount(matches.length);
            setJobsCount(matches.length);
            // Pick the top-scored job
            const best = matches.reduce((a: any, b: any) =>
              (a.selectionChance ?? 0) > (b.selectionChance ?? 0) ? a : b
            );
            setTopJob({
              title: best.title,
              company: best.company,
              location: best.location || "Remote",
              matchScore: best.selectionChance ?? 0,
            });
          }
        }
      } catch {}
    }

    // Load any custom analyzed jobs from API
    async function loadJobs() {
      try {
        const jobs = await jobApi.list();
        if (Array.isArray(jobs) && jobs.length > 0) {
          setJobsCount((prev) => prev + jobs.length);
          if (!topJob) {
            const first = jobs[0];
            setTopJob({
              title: first.title,
              company: first.company,
              location: first.location || "Remote",
              matchScore: 0,
            });
          }
        }
      } catch (err) {}
    }

    loadJobs();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      {/* 1. Main Executive Hero Section */}
      <CareerHero />

      {/* 2. 12-Column Dashboard Composition Grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* Row 1: Resume Score (3) | Career Snapshot (6) | Top Job Match (3) */}
        <div className="col-span-12 lg:col-span-3">
          <ResumeScoreCard score={latestScore} />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <CareerSnapshot
            resumesCount={resumesCount}
            jobsCount={jobsCount}
            matchesCount={matchesCount}
            outreachCount={outreachCount}
            skillsCount={resumesCount > 0 ? 18 : 0}
          />
        </div>

        <div className="col-span-12 lg:col-span-3">
          <TopJobMatch job={topJob} />
        </div>

        {/* Row 2: Quick Actions (9) | Career Assistant (3) */}
        <div className="col-span-12 lg:col-span-9">
          <QuickActions />
        </div>

        <div className="col-span-12 lg:col-span-3">
          <CareerAssistantCard />
        </div>

        {/* Row 3: Market Insights Strip (12) */}
        <div className="col-span-12">
          <MarketInsights
            targetRole="Full Stack Engineering & Data Intelligence"
            topSkills="TypeScript, React, Python, SQL, Cloud Architecture"
            demandTrend="High Growth (+32% YoY)"
            salaryRange="₹12L - ₹28L (India) / $95K - $160K (Remote/US)"
            marketStatus="Actively Hiring across Tech Giants & Startups"
          />
        </div>
      </div>
    </motion.div>
  );
}

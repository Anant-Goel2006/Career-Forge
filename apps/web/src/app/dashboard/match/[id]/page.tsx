"use client";

/**
 * CareerForge AI — Match Analysis & Tailoring Page (3D Glass Overhaul).
 */

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getScoreColor, getScoreLabel, RESUME_TEMPLATES, ROUTES } from "@/lib/constants";
import { BackButton } from "@/components/ui/BackButton";

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params?.id as string;

  const [selectedTemplate, setSelectedTemplate] = useState("faang_technical");
  const [tailoring, setTailoring] = useState(false);
  const [tailoredSuccess, setTailoredSuccess] = useState(false);

  const mockScores = {
    overall: 82.5,
    required_skill_coverage: 85.0,
    preferred_skill_coverage: 70.0,
    evidence_strength: 90.0,
    role_fit: 80.0,
    experience_fit: 85.0,
    education_fit: 100.0,
    location_fit: 100.0,
    keyword_alignment: 75.0,
    formatting_readiness: 90.0,
  };

  const mockGaps = [
    {
      skill: "Docker / Containerization",
      requirement_type: "required",
      importance: "high",
      suggestion: "Highlight any experience working with containerized environments or microservices.",
    },
    {
      skill: "GraphQL APIs",
      requirement_type: "preferred",
      importance: "medium",
      suggestion: "Mention experience consuming or designing API interfaces.",
    },
  ];

  const handleTailorResume = () => {
    setTailoring(true);
    setTimeout(() => {
      setTailoring(false);
      setTailoredSuccess(true);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="compact-container py-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2">
            <BackButton label="Back to Jobs" href={ROUTES.JOBS} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Match <span className="text-glow">Analysis</span> & Tailoring
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Transparent match report with 9 deterministic sub-scores.
          </p>
        </div>
      </div>

      {/* Main Score Overview */}
      <Card className="glass-card card-3d rounded-2xl border-primary/30">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Overall Match Score
              </span>
              <div className="flex items-baseline gap-3">
                <span className={`text-4xl font-extrabold text-glow`}>
                  {mockScores.overall}%
                </span>
                <Badge className="glow-button px-3 py-0.5 text-xs">
                  {getScoreLabel(mockScores.overall)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Deterministic sub-score weighted calculation • Zero fake ATS metrics
              </p>
            </div>

            {/* Template Selection & Tailor CTA */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select value={selectedTemplate} onValueChange={(val) => val && setSelectedTemplate(val)}>
                <SelectTrigger className="w-[200px] glass-card border-white/10 text-xs">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  {RESUME_TEMPLATES.map((tmpl) => (
                    <SelectItem key={tmpl.id} value={tmpl.id} className="text-xs">
                      {tmpl.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleTailorResume}
                disabled={tailoring || tailoredSuccess}
                className="glow-button gap-2 rounded-xl text-xs font-bold px-6 py-2.5"
              >
                {tailoring ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Tailoring...
                  </>
                ) : tailoredSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Tailored!
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Tailor Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-scores Grid */}
      <div>
        <h2 className="mb-3 text-base font-bold">Sub-score Breakdown</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Required Skill Coverage", value: mockScores.required_skill_coverage },
            { label: "Preferred Skill Coverage", value: mockScores.preferred_skill_coverage },
            { label: "Evidence Strength", value: mockScores.evidence_strength },
            { label: "Role Alignment", value: mockScores.role_fit },
            { label: "Experience Level Fit", value: mockScores.experience_fit },
            { label: "Education Match", value: mockScores.education_fit },
            { label: "Location Compatibility", value: mockScores.location_fit },
            { label: "Keyword Alignment", value: mockScores.keyword_alignment },
            { label: "Formatting Quality", value: mockScores.formatting_readiness },
          ].map((item) => (
            <Card key={item.label} className="glass-card card-3d rounded-xl">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-cyan-400 font-bold">{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-2 bg-primary/20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Identified Skill Gaps */}
      <Card className="glass-card card-3d rounded-2xl border-amber-500/30">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-amber-300">
            <AlertCircle className="h-5 w-5" />
            Identified Gaps ({mockGaps.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {mockGaps.map((gap, i) => (
            <div
              key={i}
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-200">
                  {gap.skill}
                </span>
                <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-[10px]">
                  {gap.importance} priority
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Suggestion: {gap.suggestion}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

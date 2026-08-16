/**
 * CareerForge AI — Application Constants.
 *
 * Centralized configuration for routes, features, and static values.
 * No secrets or API keys here — those are server-only.
 */

/** Application route paths */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  UPLOAD: "/dashboard/upload",
  RESUME: (id: string) => `/dashboard/resume/${id}`,
  RESUME_STUDIO: (id: string) => `/dashboard/resume/${id}/studio`,
  JOBS: "/dashboard/jobs",
  JOB_DETAIL: (id: string) => `/dashboard/jobs/${id}`,
  MATCH: (id: string) => `/dashboard/match/${id}`,
  TAILOR: (id: string) => `/dashboard/tailor/${id}`,

  OUTREACH: "/dashboard/outreach",
  ASSISTANT: "/dashboard/assistant",
  SETTINGS: "/dashboard/settings",
} as const;

/** Navigation items for sidebar and mobile nav */
export const NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: "LayoutDashboard" },
  { label: "Upload Resume", href: ROUTES.UPLOAD, icon: "Upload" },
  { label: "Job Analyzer", href: ROUTES.JOBS, icon: "Briefcase" },
  { label: "Cold Outreach AI", href: ROUTES.OUTREACH, icon: "Send" },

  { label: "AI Assistant", href: ROUTES.ASSISTANT, icon: "Bot" },
  { label: "Settings", href: ROUTES.SETTINGS, icon: "Settings" },
] as const;

/** Resume template options */
export const RESUME_TEMPLATES = [
  { id: "faang_technical", label: "FAANG Technical", description: "Optimized for tech roles at top companies" },
  { id: "analytics", label: "Analytics / Data Science", description: "Data-focused layout with project emphasis" },
  { id: "business", label: "Business / Consulting", description: "Professional layout for business roles" },
] as const;

/** Application status options */


/** File upload constraints */
export const UPLOAD_CONSTRAINTS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  ACCEPTED_TYPES: {
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  },
  ACCEPTED_EXTENSIONS: [".pdf", ".docx"],
} as const;

/** Score severity thresholds */
export const SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  FAIR: 40,
  POOR: 20,
} as const;

/** Get score color based on value */
export function getScoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return "text-emerald-500";
  if (score >= SCORE_THRESHOLDS.GOOD) return "text-blue-500";
  if (score >= SCORE_THRESHOLDS.FAIR) return "text-amber-500";
  return "text-red-500";
}

/** Get score label based on value */
export function getScoreLabel(score: number): string {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return "Excellent";
  if (score >= SCORE_THRESHOLDS.GOOD) return "Good";
  if (score >= SCORE_THRESHOLDS.FAIR) return "Fair";
  if (score >= SCORE_THRESHOLDS.POOR) return "Needs Work";
  return "Critical";
}

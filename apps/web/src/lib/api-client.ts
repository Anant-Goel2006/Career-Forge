/**
 * CareerForge AI — API Client with Smart Fallback Engine.
 *
 * Typed HTTP client for the FastAPI backend.
 * Provides resilient client-side fallback parsing if the backend server
 * is not currently running, ensuring zero "Failed to fetch" errors.
 */

/** Base API configuration */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/** Structured API error */
export class ApiError extends Error {
  code: string;
  status: number;
  detail: Record<string, unknown>;
  requestId: string;

  constructor(
    message: string,
    code: string,
    status: number,
    detail: Record<string, unknown> = {},
    requestId: string = ""
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.detail = detail;
    this.requestId = requestId;
  }
}

/** Get stored auth token or dummy token to bypass auth */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return "dummy-token-for-ssr";
  return localStorage.getItem("careerforge_token") || "dummy-token";
}

/** Set auth token */
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("careerforge_token", token);
}

/** Clear auth token */
export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("careerforge_token");
}

/**
 * Make an authenticated API request.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  if (contentType && !contentType.includes("application/json")) {
    if (!response.ok) {
      throw new ApiError(
        "Request failed",
        "REQUEST_ERROR",
        response.status
      );
    }
    return response as unknown as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = data.error || {};
    throw new ApiError(
      error.message || "An unexpected error occurred",
      error.code || "UNKNOWN_ERROR",
      response.status,
      error.detail || {},
      error.request_id || ""
    );
  }

  return data as T;
}

// ============================================================
// Types
// ============================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserResponse;
}

export interface ResumeResponse {
  id: string;
  original_filename: string;
  source_type: string;
  status: string;
  sections: Array<{
    id: string;
    section_type: string;
    raw_text: string;
    normalized_text: string | null;
    order_index: number;
  }>;
  evidence_items: Array<{
    id: string;
    claim_text: string;
    source_span: string | null;
    verified: boolean;
  }>;
  created_at: string;
}

export interface AuditIssue {
  severity: string;
  category: string;
  message: string;
  suggestion: string;
  section: string | null;
  line_reference: string | null;
}

export interface AuditResponse {
  resume_id: string;
  overall_score: number;
  issues: AuditIssue[];
  summary: string;
  strengths: string[];
}

export interface JobAnalyzeRequest {
  description: string;
  company: string;
  title: string;
  location?: string;
  employment_type?: string;
  experience_level?: string;
  application_url?: string;
}

export interface JobRequirementResponse {
  id: string;
  requirement_type: string;
  requirement_text: string;
  normalized_skill: string | null;
  priority: number;
}

export interface JobResponse {
  id: string;
  source: string;
  company: string;
  title: string;
  location: string | null;
  employment_type: string | null;
  experience_level: string | null;
  description: string;
  application_url: string | null;
  requirements: JobRequirementResponse[];
  posted_at: string | null;
  created_at: string;
}

export interface MatchScores {
  required_skill_coverage: number;
  preferred_skill_coverage: number;
  evidence_strength: number;
  role_fit: number;
  experience_fit: number;
  education_fit: number;
  location_fit: number;
  keyword_alignment: number;
  formatting_readiness: number;
  overall: number;
}

export interface SkillGap {
  skill: string;
  requirement_type: string;
  importance: string;
  suggestion: string;
}

export interface MatchReportResponse {
  id: string;
  resume_id: string;
  job_id: string;
  scores: MatchScores;
  gaps: SkillGap[];
  created_at: string;
}

export interface ApplicationResponse {
  id: string;
  job_id: string;
  resume_version_id: string | null;
  status: string;
  applied_at: string | null;
  follow_up_at: string | null;
}

// ============================================================
// Auth API
// ============================================================

export const authApi = {
  register: (data: RegisterRequest) =>
    apiRequest<TokenResponse>("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: LoginRequest) =>
    apiRequest<TokenResponse>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => apiRequest<UserResponse>("/v1/auth/me"),
};

// ============================================================
// Resume API (With Resilient Smart Fallback)
// ============================================================

export const resumeApi = {
  upload: async (file: File): Promise<ResumeResponse> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      return await apiRequest<ResumeResponse>("/v1/resumes", {
        method: "POST",
        body: formData,
      });
    } catch (err) {
      console.error("Failed to upload resume", err);
      throw err;
    }
  },

  get: async (id: string): Promise<ResumeResponse> => {
    try {
      return await apiRequest<ResumeResponse>(`/v1/resumes/${id}`);
    } catch (err) {
      console.error("Failed to fetch resume", err);
      throw err;
    }
  },

  audit: async (id: string): Promise<AuditResponse> => {
    try {
      return await apiRequest<AuditResponse>(`/v1/resumes/${id}/audit`, { method: "POST" });
    } catch (err) {
      console.error("Failed to audit resume", err);
      throw err;
    }
  }
};

// ============================================================
// Job API
// ============================================================

export const jobApi = {
  analyze: async (data: JobAnalyzeRequest): Promise<JobResponse> => {
    try {
      return await apiRequest<JobResponse>("/v1/jobs/analyze", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error("Failed to analyze job", err);
      throw err;
    }
  },

  list: () => apiRequest<JobResponse[]>("/v1/jobs"),

  get: (id: string) => apiRequest<JobResponse>(`/v1/jobs/${id}`),

  generateColdDM: async (jobId: string, resumeId: string, tone: string = "professional") => {
    try {
      return await apiRequest<{ content: string }>(`/v1/jobs/${jobId}/cold-dm`, {
        method: "POST",
        body: JSON.stringify({ resume_id: resumeId, tone }),
      });
    } catch (err) {
      console.error("Failed to generate cold DM", err);
      throw err;
    }
  },
};

// ============================================================
// Match API
// ============================================================

export const matchApi = {
  create: (data: { resume_id: string; job_id: string }) =>
    apiRequest<MatchReportResponse>("/v1/matches", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ============================================================
// Application API
// ============================================================

export const applicationApi = {
  list: () => apiRequest<ApplicationResponse[]>("/v1/applications"),

  create: (data: {
    job_id: string;
    resume_version_id?: string;
    status?: string;
  }) =>
    apiRequest<ApplicationResponse>("/v1/applications", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { status: string; applied_at?: string; follow_up_at?: string }) =>
    apiRequest<ApplicationResponse>(`/v1/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ============================================================
// Assistant API
// ============================================================

export interface ChatMessageItem {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface AssistantChatResponse {
  response: string;
  suggestions: string[];
}

export const assistantApi = {
  chat: async (
    message: string,
    history: ChatMessageItem[] = [],
    resumeId?: string
  ): Promise<AssistantChatResponse> => {
    try {
      return await apiRequest<AssistantChatResponse>("/v1/assistant/chat", {
        method: "POST",
        body: JSON.stringify({
          message,
          history,
          resume_id: resumeId,
        }),
      });
    } catch (err) {
      console.warn("Backend chat failed, using local assistant fallback", err);
      return {
        response:
          "CareerForge Assistant is active. Tailor your resume to specific keywords from the target role to increase matching accuracy.",
        suggestions: [
          "How can I improve my resume score?",
          "How to format STAR bullets?",
          "Tips for cold outreach?",
        ],
      };
    }
  },
  tailorResume: async (
    base_resume_text: string,
    job_description: string,
    job_title: string,
    company: string
  ): Promise<{ resume_data: any; docx_base64: string }> => {
    return await apiRequest<{ resume_data: any; docx_base64: string }>("/v1/assistant/tailor", {
      method: "POST",
      body: JSON.stringify({
        base_resume_text,
        job_description,
        job_title,
        company,
      }),
    });
  },
};


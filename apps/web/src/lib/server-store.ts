import { ParsedResumeResult, AuditResult } from "./pdf-parser";

interface StoredData {
  resumes: Map<string, ParsedResumeResult>;
  audits: Map<string, AuditResult>;
  jobs: Map<string, any>;
}

// Global in-memory cache across serverless warm invocations
declare global {
  var __careerforge_store: StoredData | undefined;
}

if (!global.__careerforge_store) {
  global.__careerforge_store = {
    resumes: new Map(),
    audits: new Map(),
    jobs: new Map(),
  };
}

export const serverStore = global.__careerforge_store;

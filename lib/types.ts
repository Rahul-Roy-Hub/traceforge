import type { Analysis } from "@/lib/schemas";

export type AnalysisStatus = "Completed" | "In Progress" | "Failed";
export type Confidence = "High" | "Medium" | "Low";
export type SkillVisibility = "Public" | "Private";

export type IssueCategory =
  | "Frontend"
  | "Backend"
  | "Database"
  | "DevOps"
  | "Docker"
  | "Build Tool"
  | "TypeScript"
  | "Configuration"
  | "Module Resolution";

export type FixStep = {
  title: string;
  description: string;
  filename: string;
  language: string;
  code: string;
};

export type SkillFile = {
  path: string;
  content: string;
};

export type SkillValidation = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type SkillRecord = {
  id: string;
  name: string;
  category: IssueCategory;
  description: string;
  visibility: SkillVisibility;
  updated: string;
  files: SkillFile[];
  validation?: SkillValidation;
};

export type OriginalInput = {
  source: string;
  subtitle: string;
  errorLines: string[];
  fileRef?: string;
};

export type AnalysisRecord = {
  id: string;
  title: string;
  issueType: IssueCategory;
  status: AnalysisStatus;
  date: string;
  time: string;
  error: string;
  description: string;
  confidence: Confidence;
  issueDetected: string;
  whatIsHappening: string;
  likelyCause: string;
  whyLikely: string;
  additionalContext: string;
  evidence: string[];
  reproductionSteps: string[];
  suggestedFix: string;
  validationChecklist: string[];
  references: { title: string; detail: string }[];
  fixSteps: FixStep[];
  originalInput: OriginalInput;
  skillId: string;
  createdAt: number;
  apiAnalysis?: Analysis;
};

export type HistoryItem = {
  id: string;
  title: string;
  subtitle: string;
  issueType: IssueCategory;
  status: AnalysisStatus;
  date: string;
  time: string;
};

export type ExampleCard = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  logText: string;
  preview: string[];
};

export type TemplateRecord = {
  id: string;
  name: string;
  category: IssueCategory;
  description: string;
};

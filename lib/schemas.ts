import { z } from "zod";

export const EvidenceSchema = z.object({
  observation: z.string().min(1),
  source: z.enum(["image", "log", "user_context"]),
  importance: z.enum(["high", "medium", "low"]),
});

export const LikelyCauseSchema = z.object({
  cause: z.string().min(1),
  reasoning: z.string().min(1),
  confidence: z.enum(["high", "medium", "low"]),
});

export const AnalysisSchema = z.object({
  issueCategory: z.string().min(1),
  summary: z.string().min(1),
  evidence: z.array(EvidenceSchema),
  likelyCauses: z.array(LikelyCauseSchema),
  reproductionSteps: z.array(z.string()),
  fixSteps: z.array(z.string()),
  validationChecklist: z.array(z.string()),
  unknowns: z.array(z.string()),
});

export type Analysis = z.infer<typeof AnalysisSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type LikelyCause = z.infer<typeof LikelyCauseSchema>;

export const GenerateSkillRequestSchema = z.object({
  analysis: AnalysisSchema,
});

export const ValidateSkillRequestSchema = z.object({
  skillContent: z.string().min(1),
  skillName: z.string().optional(),
});

export const ExportSkillRequestSchema = z.object({
  skillName: z.string().min(1),
  skillContent: z.string().min(1),
  troubleshooting: z.string().optional(),
});

export const HarnessRequestSchema = z
  .object({
    skillContent: z.string().optional(),
    skillName: z.string().optional(),
  })
  .optional();

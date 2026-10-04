import { GoogleGenAI, ThinkingLevel, type Part } from "@google/genai";
import { DEFAULT_GEMMA_MODEL } from "./constants";
import {
  buildAnalysisPrompt,
  buildRepairPrompt,
  TRACEFORGE_SYSTEM_PROMPT,
} from "./prompts";
import { AnalysisSchema, type Analysis } from "./schemas";

export type ImageInput = {
  mimeType: string;
  base64: string;
};

export type AnalyzeInput = {
  userContext: string;
  logText?: string;
  projectContext?: string;
  image?: ImageInput;
};

function getModel(): string {
  return process.env.GEMMA_MODEL?.trim() || DEFAULT_GEMMA_MODEL;
}

function getThinkingLevel(): ThinkingLevel {
  const raw = (process.env.GEMMA_THINKING_LEVEL ?? "high").trim().toLowerCase();
  return raw === "minimal" ? ThinkingLevel.MINIMAL : ThinkingLevel.HIGH;
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local or the Render environment.",
    );
  }
  return new GoogleGenAI({ apiKey });
}

function extractJsonText(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

function parseAnalysisJson(raw: string): Analysis {
  const parsed: unknown = JSON.parse(extractJsonText(raw));
  return AnalysisSchema.parse(parsed);
}

function getResponseText(parts: Part[] | undefined): string {
  if (!parts?.length) {
    return "";
  }
  return parts
    .filter((part) => !part.thought && Boolean(part.text))
    .map((part) => part.text)
    .join("\n")
    .trim();
}

async function generateJson(input: {
  prompt: string;
  image?: ImageInput;
  previousText?: string;
  repairPrompt?: string;
}): Promise<string> {
  const client = getClient();
  const parts: Part[] = [];

  if (input.image) {
    parts.push({
      inlineData: {
        mimeType: input.image.mimeType,
        data: input.image.base64,
      },
    });
  }
  parts.push({ text: input.prompt });

  const contents = input.repairPrompt
    ? [
        { role: "user", parts },
        { role: "model", parts: [{ text: input.previousText ?? "" }] },
        { role: "user", parts: [{ text: input.repairPrompt }] },
      ]
    : [{ role: "user", parts }];

  const response = await client.models.generateContent({
    model: getModel(),
    contents,
    config: {
      systemInstruction: TRACEFORGE_SYSTEM_PROMPT,
      thinkingConfig: {
        thinkingLevel: getThinkingLevel(),
      },
      responseMimeType: "application/json",
    },
  });

  const text =
    response.text?.trim() ||
    getResponseText(response.candidates?.[0]?.content?.parts);

  if (!text) {
    throw new Error("Gemma 4 returned an empty response.");
  }

  return text;
}

export async function analyzeIssue(input: AnalyzeInput): Promise<{
  analysis: Analysis;
  usedImage: boolean;
  repaired: boolean;
  model: string;
}> {
  const prompt = buildAnalysisPrompt({
    userContext: input.userContext,
    logText: input.logText,
    projectContext: input.projectContext,
    hasImage: Boolean(input.image),
  });

  let usedImage = Boolean(input.image);
  let raw: string;

  try {
    raw = await generateJson({
      prompt,
      image: input.image,
    });
  } catch (error) {
    const canFallback =
      Boolean(input.image) &&
      Boolean(input.userContext.trim() || input.logText?.trim());

    if (!canFallback) {
      throw error;
    }

    usedImage = false;
    raw = await generateJson({
      prompt: buildAnalysisPrompt({
        userContext: input.userContext,
        logText: input.logText,
        projectContext: input.projectContext,
        hasImage: false,
      }),
    });
  }

  try {
    return {
      analysis: parseAnalysisJson(raw),
      usedImage,
      repaired: false,
      model: getModel(),
    };
  } catch (error) {
    const parseError = error instanceof Error ? error.message : String(error);
    const repairedRaw = await generateJson({
      prompt,
      previousText: raw,
      repairPrompt: buildRepairPrompt(raw, parseError),
    });

    return {
      analysis: parseAnalysisJson(repairedRaw),
      usedImage,
      repaired: true,
      model: getModel(),
    };
  }
}

export function getConfiguredModel(): string {
  return getModel();
}

export function hasGeminiApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

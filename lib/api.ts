import { AnalysisSchema, type Analysis } from "@/lib/schemas";

export async function readApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export function parseAnalysisResponse(data: unknown): Analysis {
  if (!data || typeof data !== "object") {
    throw new Error("Analysis response was empty.");
  }
  const { meta: _meta, ...rest } = data as Record<string, unknown>;
  void _meta;
  return AnalysisSchema.parse(rest);
}

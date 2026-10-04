import { getConfiguredModel, hasGeminiApiKey } from "@/lib/gemma";
import { jsonOk, optionsResponse } from "@/lib/http";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

export function GET() {
  return jsonOk({
    ok: true,
    service: "traceforge",
    model: getConfiguredModel(),
    hasApiKey: hasGeminiApiKey(),
  });
}

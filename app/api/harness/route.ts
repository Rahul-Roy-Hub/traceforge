import { jsonError, jsonOk, optionsResponse } from "@/lib/http";
import { HarnessRequestSchema } from "@/lib/schemas";
import { runHarness } from "@/lib/skill-harness";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    let body: unknown = {};
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      body = await request.json();
    }

    const parsed = HarnessRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid harness payload.", 400, {
        details: parsed.error.issues,
      });
    }

    const result = runHarness(parsed.data);
    return jsonOk(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Harness failed.";
    return jsonError(message, 500);
  }
}

export async function GET() {
  return jsonOk(runHarness());
}

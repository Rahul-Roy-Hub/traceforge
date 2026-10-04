import { jsonError, jsonOk, optionsResponse } from "@/lib/http";
import { ValidateSkillRequestSchema } from "@/lib/schemas";
import { validateSkill } from "@/lib/skill-validator";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = ValidateSkillRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("skillContent is required.", 400, {
        details: parsed.error.issues,
      });
    }

    const validation = validateSkill(
      parsed.data.skillContent,
      parsed.data.skillName,
    );

    return jsonOk(validation);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Skill validation failed.";
    return jsonError(message, 500);
  }
}

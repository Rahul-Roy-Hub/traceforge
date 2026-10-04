import { jsonError, jsonOk, optionsResponse } from "@/lib/http";
import { GenerateSkillRequestSchema } from "@/lib/schemas";
import { generateSkillPackage } from "@/lib/skill-generator";
import { validateSkill } from "@/lib/skill-validator";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = GenerateSkillRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid analysis payload.", 400, {
        details: parsed.error.issues,
      });
    }

    const skillPackage = generateSkillPackage(parsed.data.analysis);
    const validation = validateSkill(
      skillPackage.skillContent,
      skillPackage.skillName,
    );

    if (skillPackage.files.some((file) => file.path.includes("/references/"))) {
      validation.warnings = validation.warnings.filter(
        (warning) => warning !== "No references directory provided.",
      );
    }

    return jsonOk({
      skillName: skillPackage.skillName,
      skillContent: skillPackage.skillContent,
      troubleshooting: skillPackage.troubleshooting,
      package: {
        files: skillPackage.files,
      },
      validation,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Skill generation failed.";
    return jsonError(message, 500);
  }
}

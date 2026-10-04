import { binaryResponse, jsonError, optionsResponse } from "@/lib/http";
import { ExportSkillRequestSchema } from "@/lib/schemas";
import { generateSkillName } from "@/lib/skill-generator";
import { buildSkillZip } from "@/lib/zip";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = ExportSkillRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("skillName and skillContent are required.", 400, {
        details: parsed.error.issues,
      });
    }

    const skillName = generateSkillName(parsed.data.skillName);
    const troubleshooting =
      parsed.data.troubleshooting ??
      `# Troubleshooting ${skillName}\n\nSee SKILL.md for the reusable workflow.\n`;

    const zip = await buildSkillZip({
      skillName,
      skillContent: parsed.data.skillContent,
      troubleshooting,
      files: [
        { path: `skills/${skillName}/SKILL.md`, content: parsed.data.skillContent },
        {
          path: `skills/${skillName}/references/troubleshooting.md`,
          content: troubleshooting,
        },
      ],
    });

    return binaryResponse(zip, {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${skillName}.zip"`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ZIP export failed.";
    return jsonError(message, 500);
  }
}

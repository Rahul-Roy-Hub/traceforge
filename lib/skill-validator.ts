import yaml from "js-yaml";
import {
  REQUIRED_SKILL_SECTIONS,
  SKILL_DESCRIPTION_MAX,
  SKILL_NAME_MAX,
  SKILL_NAME_PATTERN,
} from "./constants";

export type SkillValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    name?: string;
    description?: string;
    license?: string;
  };
};

function parseFrontmatter(skillContent: string): {
  raw: string;
  body: string;
} | null {
  const match = skillContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return null;
  }
  return { raw: match[1], body: match[2] };
}

export function validateSkill(
  skillContent: string,
  skillName?: string,
): SkillValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!skillContent.trim()) {
    return {
      valid: false,
      errors: ["File exists check failed: SKILL.md content is empty."],
      warnings,
    };
  }

  const parsed = parseFrontmatter(skillContent);
  if (!parsed) {
    return {
      valid: false,
      errors: ["Frontmatter exists check failed: missing YAML frontmatter delimited by ---."],
      warnings,
    };
  }

  let metadata: Record<string, unknown>;
  try {
    const loaded = yaml.load(parsed.raw);
    if (!loaded || typeof loaded !== "object" || Array.isArray(loaded)) {
      throw new Error("Frontmatter is not a mapping.");
    }
    metadata = loaded as Record<string, unknown>;
  } catch (error) {
    return {
      valid: false,
      errors: [
        `No malformed YAML/frontmatter check failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ],
      warnings,
    };
  }

  const name = typeof metadata.name === "string" ? metadata.name.trim() : "";
  const description =
    typeof metadata.description === "string" ? metadata.description.trim() : "";
  const license = typeof metadata.license === "string" ? metadata.license.trim() : "";
  const body = parsed.body.trim();

  if (!name) {
    errors.push("Name present check failed: frontmatter name is missing.");
  } else {
    if (name.length > SKILL_NAME_MAX) {
      errors.push(`Name is valid check failed: name exceeds ${SKILL_NAME_MAX} characters.`);
    }
    if (!SKILL_NAME_PATTERN.test(name)) {
      errors.push(
        "Name is valid check failed: use lowercase letters, numbers, and single hyphens only.",
      );
    }
  }

  if (!description) {
    errors.push("Description present check failed: frontmatter description is missing.");
  } else if (description.length > SKILL_DESCRIPTION_MAX) {
    errors.push(
      `Description present check failed: description exceeds ${SKILL_DESCRIPTION_MAX} characters.`,
    );
  }

  if (!body) {
    errors.push("No empty instruction body check failed: markdown body is empty.");
  }

  for (const section of REQUIRED_SKILL_SECTIONS) {
    const heading = new RegExp(`^##\\s+${section}\\s*$`, "im");
    if (!heading.test(parsed.body)) {
      errors.push(
        `Required instruction section present check failed: missing "## ${section}".`,
      );
    }
  }

  if (skillName && name && skillName !== name) {
    errors.push(
      `Package structure is valid check failed: directory/name "${skillName}" does not match frontmatter name "${name}".`,
    );
  }

  if (!license) {
    warnings.push("No license field provided in frontmatter.");
  }

  if (!/references\//i.test(skillContent) && !parsed.body.includes("references/")) {
    warnings.push("No references directory provided.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      name: name || undefined,
      description: description || undefined,
      license: license || undefined,
    },
  };
}

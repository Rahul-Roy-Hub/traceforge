export const DEFAULT_GEMMA_MODEL = "gemma-4-26b-a4b-it";
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const SECRETS_WARNING =
  "Tip: Remove secrets, API keys, passwords, and private tokens before uploading screenshots or logs.";
export const REQUIRED_SKILL_SECTIONS = [
  "Purpose",
  "Workflow",
  "Evidence Rules",
  "Validation",
] as const;
export const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SKILL_NAME_MAX = 64;
export const SKILL_DESCRIPTION_MAX = 1024;

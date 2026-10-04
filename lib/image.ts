import { ALLOWED_MIME_TYPES, MAX_IMAGE_BYTES } from "./constants";

const EXTENSION_MIME: Record<string, (typeof ALLOWED_MIME_TYPES)[number]> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export type PreparedImage = {
  mimeType: string;
  base64: string;
  filename: string;
  byteLength: number;
};

export function inferImageMime(file: File): string | null {
  const type = file.type.toLowerCase();
  if ((ALLOWED_MIME_TYPES as readonly string[]).includes(type)) {
    return type;
  }

  const name = file.name.toLowerCase();
  const ext = Object.keys(EXTENSION_MIME).find((suffix) => name.endsWith(suffix));
  return ext ? EXTENSION_MIME[ext] : null;
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  const mimeType = inferImageMime(file);
  if (!mimeType) {
    throw new Error("Unsupported image type. Upload PNG, JPG, or WebP.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large. Maximum size is 8MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    mimeType,
    base64: buffer.toString("base64"),
    filename: file.name,
    byteLength: buffer.byteLength,
  };
}

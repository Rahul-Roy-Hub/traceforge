import { SECRETS_WARNING } from "@/lib/constants";
import { analyzeIssue } from "@/lib/gemma";
import { jsonError, jsonOk, optionsResponse } from "@/lib/http";
import { prepareImage } from "@/lib/image";

export const runtime = "nodejs";
export const maxDuration = 120;

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageValue = formData.get("image");
    const userContext = String(formData.get("userContext") ?? "").trim();
    const logText = String(formData.get("logText") ?? "").trim();
    const projectContext = String(formData.get("projectContext") ?? "").trim();

    if (!userContext) {
      return jsonError("userContext is required.");
    }

    const imageFile =
      imageValue instanceof File
        ? imageValue
        : imageValue instanceof Blob
          ? new File([imageValue], "page-screenshot.png", {
              type: imageValue.type || "image/png",
            })
          : null;

    if (!imageFile || imageFile.size === 0) {
      return jsonError("image is required. Upload a PNG, JPG, or WebP screenshot.");
    }

    const image = await prepareImage(imageFile);
    const result = await analyzeIssue({
      userContext,
      logText: logText || undefined,
      projectContext: projectContext || undefined,
      image,
    });

    return jsonOk({
      ...result.analysis,
      meta: {
        model: result.model,
        usedImage: result.usedImage,
        repaired: result.repaired,
        warning: SECRETS_WARNING,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed.";
    const status = message.includes("GEMINI_API_KEY") ? 500 : 400;
    return jsonError(message, status);
  }
}

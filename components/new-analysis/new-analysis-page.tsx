"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ImagePlus,
  Link2,
  Clipboard,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { demoExamples } from "@/lib/demo-examples";
import { useAnalysisStore } from "@/lib/analysis-store";
import { mapApiToAnalysis } from "@/lib/map-analysis";
import { parseAnalysisResponse, readApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

export function NewAnalysisPage() {
  const searchParams = useSearchParams();
  const exampleId = searchParams.get("example") ?? "";
  return <NewAnalysisForm key={exampleId} exampleId={exampleId} />;
}

function NewAnalysisForm({ exampleId }: { exampleId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const { upsertAnalysis } = useAnalysisStore();
  const example = demoExamples.find((item) => item.id === exampleId);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState(example?.description ?? "");
  const [logText, setLogText] = useState(example?.logText ?? "");
  const [projectContext, setProjectContext] = useState("");
  const [urlOpen, setUrlOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function assignFile(next: File) {
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setError(null);
  }

  async function onPaste() {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((value) => value.startsWith("image/"));
        if (!type) continue;
        const blob = await item.getType(type);
        assignFile(new File([blob], "pasted-screenshot.png", { type }));
        return;
      }
      setError("No image found on the clipboard.");
    } catch {
      setError("Clipboard access was blocked. Upload an image instead.");
    }
  }

  async function fetchImageFromUrl() {
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Could not download that image URL.");
      }
      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) {
        throw new Error("The URL did not return a PNG, JPG, or WebP image.");
      }
      const extension = blob.type.split("/")[1] || "png";
      assignFile(new File([blob], `url-screenshot.${extension}`, { type: blob.type }));
      setUrlOpen(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not download that image URL.",
      );
    }
  }

  async function analyze() {
    setError(null);
    if (!file) {
      setError("Upload a PNG, JPG, or WebP screenshot.");
      return;
    }
    if (!description.trim()) {
      setError("Describe what you were trying to do.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("image", file);
    formData.set("userContext", description.trim());
    if (logText.trim()) formData.set("logText", logText.trim());
    if (projectContext.trim()) {
      formData.set("projectContext", projectContext.trim());
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }
      const analysis = parseAnalysisResponse(await response.json());
      const id = `analysis-${Date.now()}`;
      upsertAnalysis(
        mapApiToAnalysis(analysis, {
          id,
          description: description.trim(),
          originalInput: {
            source: "Uploaded screenshot",
            subtitle: file.name,
            errorLines: logText.trim()
              ? logText.trim().split("\n").slice(0, 8)
              : [analysis.summary],
          },
          imagePreview: preview ?? undefined,
        }),
      );
      router.push(`/analysis/${id}`);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Analysis failed. Check the screenshot, description, and GEMINI_API_KEY.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-card px-6 py-5 text-center shadow-lg">
            <Sparkles className="mx-auto mb-2 size-6 animate-pulse text-primary" />
            <p className="font-medium">Analyzing with Gemma 4...</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Reading visual evidence and correlating logs.
            </p>
          </div>
        </div>
      ) : null}

      <PageHeader
        title="New Analysis"
        description="Upload a screenshot, paste the error log, and describe the problem. Gemma 4 analyzes the evidence."
        actions={
          <div className="max-w-xs rounded-2xl border border-border bg-primary-light/70 px-4 py-3 text-sm text-foreground">
            <span className="mr-2 inline-flex size-7 items-center justify-center rounded-lg bg-background text-primary">
              <Sparkles className="size-4" />
            </span>
            Remove secrets before uploading screenshots or logs.
          </div>
        }
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          const dropped = event.dataTransfer.files[0];
          if (dropped) assignFile(dropped);
        }}
        className={cn(
          "rounded-[28px] border-2 border-dashed border-border bg-gradient-to-b from-primary-light/40 to-background px-6 py-14 text-center",
          dragOver && "border-primary bg-primary-light/50",
        )}
      >
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <ImagePlus className="size-8" />
        </div>
        <p className="text-lg font-semibold">
          {preview ? "Screenshot ready" : "Drag and drop an image here"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">or choose an option below</p>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Selected screenshot"
            className="mx-auto mt-6 max-h-48 rounded-xl border border-border"
          />
        ) : null}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={() => fileRef.current?.click()}>
            <ImagePlus />
            Upload Image
          </Button>
          <Button type="button" variant="outline" onClick={onPaste}>
            <Clipboard />
            Paste Screenshot
          </Button>
          <Button type="button" variant="outline" onClick={() => setUrlOpen(true)}>
            <Link2 />
            Enter URL
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Supported: PNG, JPG, WEBP • Max 8MB
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const next = event.target.files?.[0];
            if (next) assignFile(next);
          }}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4">
        <label htmlFor="description" className="text-sm font-medium">
          What were you trying to do?
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="e.g. The deployment started failing after I moved a component..."
          className="mt-2 min-h-24"
        />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <label htmlFor="logText" className="text-sm font-medium">
          Error / log (optional)
        </label>
        <Textarea
          id="logText"
          value={logText}
          onChange={(event) => setLogText(event.target.value)}
          placeholder="Paste stack traces, terminal output, or CI logs..."
          className="mt-2 min-h-28 font-mono"
        />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <label htmlFor="projectContext" className="text-sm font-medium">
          Project context (optional)
        </label>
        <Textarea
          id="projectContext"
          value={projectContext}
          onChange={(event) => setProjectContext(event.target.value)}
          placeholder="Framework, repo layout, or recent changes..."
          className="mt-2 min-h-20"
        />
      </div>

      {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}

      <div className="mt-6 flex justify-center">
        <Button
          type="button"
          size="lg"
          className="h-12 rounded-full px-8 text-base"
          onClick={() => void analyze()}
        >
          <Sparkles />
          Analyze with Gemma 4
        </Button>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Try an example</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Prefills the description and log. Upload a screenshot, then analyze with
          Gemma 4.
        </p>
      </div>
      <div id="examples" className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {demoExamples.map((example) => (
          <button
            key={example.id}
            type="button"
            onClick={() => {
              setDescription(example.description);
              setLogText(example.logText);
              setError(null);
            }}
            className="rounded-2xl border border-border bg-card p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-3 overflow-hidden rounded-xl bg-[#151a24] p-3 font-mono text-[11px] leading-5 text-[#d7deea]">
              {example.preview.map((line) => (
                <p key={line} className="truncate">
                  {line}
                </p>
              ))}
            </div>
            <p className="font-semibold">{example.title}</p>
            <p className="text-xs text-muted-foreground">{example.subtitle}</p>
          </button>
        ))}
      </div>

      <Dialog open={urlOpen} onOpenChange={setUrlOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter image URL</DialogTitle>
          </DialogHeader>
          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://..."
          />
          <Button onClick={() => void fetchImageFromUrl()}>Use URL</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

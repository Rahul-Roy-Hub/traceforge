"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  Link2,
  Clipboard,
  Sparkles,
  WandSparkles,
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
import { exampleCards } from "@/lib/mock-data";
import { useAnalysisStore } from "@/lib/analysis-store";
import { mapApiToAnalysis } from "@/lib/map-analysis";
import { getAnalysisById } from "@/lib/mock-data";
import type { Analysis } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export function NewAnalysisPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const { upsertAnalysis } = useAnalysisStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
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

  async function analyze(analysisId?: string) {
    setError(null);
    if (analysisId) {
      setLoading(true);
      window.setTimeout(() => {
        router.push(`/analysis/${analysisId}`);
      }, 700);
      return;
    }

    if (!file) {
      setError("Upload a PNG, JPG, or WEBP screenshot, or pick an example.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("image", file);
    formData.set(
      "userContext",
      description.trim() || "The build started failing after a recent change.",
    );

    try {
      const response = await fetch("/api/analyze", { method: "POST", body: formData });
      if (!response.ok) {
        throw new Error(await readError(response));
      }
      const data = (await response.json()) as Analysis;
      const id = `analysis-${Date.now()}`;
      upsertAnalysis(
        mapApiToAnalysis(data, {
          id,
          description: description.trim() || "Uploaded from New Analysis.",
          originalInput: {
            source: "Uploaded screenshot",
            subtitle: file.name,
            errorLines: [data.summary],
          },
          imagePreview: preview ?? undefined,
        }),
      );
      router.push(`/analysis/${id}`);
    } catch (caught) {
      const fallback = getAnalysisById("analysis-001");
      upsertAnalysis({
        ...fallback,
        description: description || fallback.description,
      });
      setError(
        caught instanceof Error
          ? `${caught.message} Showing the demo analysis instead.`
          : "Analysis failed. Showing the demo analysis instead.",
      );
      window.setTimeout(() => router.push("/analysis/analysis-001"), 900);
    }
  }

  return (
    <div>
      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-card px-6 py-5 text-center shadow-lg">
            <Sparkles className="mx-auto mb-2 size-6 animate-pulse text-primary" />
            <p className="font-medium">Analyzing with Gemini 4...</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Reading the screenshot and description.
            </p>
          </div>
        </div>
      ) : null}

      <PageHeader
        title="New Analysis"
        description="Upload your screenshot, error log or describe the problem."
        actions={
          <div className="max-w-xs rounded-2xl border border-border bg-primary-light/70 px-4 py-3 text-sm text-foreground">
            <span className="mr-2 inline-flex size-7 items-center justify-center rounded-lg bg-background text-primary">
              <Sparkles className="size-4" />
            </span>
            Get instant, step-by-step fixes with explanations and resources.
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
          <img src={preview} alt="Selected screenshot" className="mx-auto mt-6 max-h-48 rounded-xl border border-border" />
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
          Supported: PNG, JPG, WEBP • Max 10MB
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
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="description" className="text-sm font-medium">
            Add a description (optional)
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={() =>
              setDescription(
                (current) =>
                  current.trim() ||
                  "Getting this error while running my React app after adding a new dependency...",
              )
            }
          >
            <WandSparkles className="size-3.5" />
            Improve with AI
          </Button>
        </div>
        <Textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="e.g. Getting this error while running my React app after adding a new dependency..."
          className="min-h-24"
        />
      </div>

      {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}

      <div className="mt-6 flex justify-center">
        <Button
          type="button"
          size="lg"
          className="h-12 rounded-full px-8 text-base"
          onClick={() => analyze()}
        >
          <Sparkles />
          Analyze with Gemini 4 →
        </Button>
      </div>

      <div className="mt-10 flex items-end justify-between">
        <h2 className="text-lg font-semibold">Try an example</h2>
        <Button variant="link" className="px-0" asChild>
          <a href="#examples">View all examples →</a>
        </Button>
      </div>
      <div id="examples" className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {exampleCards.map((example) => (
          <button
            key={example.id}
            type="button"
            onClick={() => analyze(example.analysisId)}
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
          <Button
            onClick={() => {
              setPreview(url);
              setUrlOpen(false);
            }}
          >
            Use URL
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

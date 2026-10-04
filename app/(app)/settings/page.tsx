import { PageHeader } from "@/components/layout/page-header";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Gemma 4 runs through the Gemini API. Keep the key on the server."
      />
      <div className="grid max-w-2xl gap-4">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-2 font-semibold">API setup</h2>
          <p className="text-sm text-muted-foreground">
            Set <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">GEMINI_API_KEY</code>{" "}
            in <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">.env.local</code>{" "}
            or the Render dashboard. Analyses call{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">POST /api/analyze</code>{" "}
            with your screenshot, description, and optional log.
          </p>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-2 font-semibold">Privacy</h2>
          <p className="text-sm text-muted-foreground">
            Remove secrets, API keys, passwords, and private tokens before uploading
            screenshots or logs. TraceForge does not store screenshots on the server.
          </p>
        </section>
      </div>
    </div>
  );
}

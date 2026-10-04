export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6">
      <main className="flex max-w-xl flex-col items-center gap-4 text-center">
        <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
          Next.js App Router
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
          TraceForge
        </h1>
        <p className="text-lg leading-7 text-zinc-600">
          AI-powered developer debugging assistant. Upload a screenshot, error
          log, or description to analyze issues and generate a fix.
        </p>
      </main>
    </div>
  );
}

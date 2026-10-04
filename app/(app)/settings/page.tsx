import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Profile, preferences, and workspace defaults for this hackathon demo."
      />
      <div className="grid max-w-2xl gap-4">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold">Profile</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Name
              <Input className="mt-1" defaultValue="Lokesh" />
            </label>
            <label className="text-sm">
              Mode
              <Input className="mt-1" defaultValue="Hackathon Mode" />
            </label>
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-2 font-semibold">Credits</h2>
          <p className="text-sm text-muted-foreground">
            100 credits left. This is mock data for the demo and is not billed.
          </p>
        </section>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loadSettings, saveSettings, defaultSettings, clearHistory, type AppSettings } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Productivity Hub" },
      { name: "description", content: "Customize theme, AI output length, and data preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [s, setS] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    setS(loadSettings());
  }, []);

  const update = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) => {
    const next = { ...s, [k]: v };
    setS(next);
    saveSettings(next);
    if (k === "theme") {
      document.documentElement.classList.toggle("dark", v === "dark");
    }
    toast.success("Settings updated");
  };

  return (
    <AppShell title="Settings" subtitle="Personalize your AI Productivity Hub">
      <div className="mx-auto grid max-w-3xl gap-6">
        <Card title="Appearance">
          <Row label="Theme">
            <Select value={s.theme} onValueChange={(v) => update("theme", v as AppSettings["theme"])}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </Card>

        <Card title="AI Output">
          <Row label="Response length">
            <Select
              value={s.responseLength}
              onValueChange={(v) => update("responseLength", v as AppSettings["responseLength"])}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="long">Long</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Default export format">
            <Select
              value={s.exportFormat}
              onValueChange={(v) => update("exportFormat", v as AppSettings["exportFormat"])}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="md">Markdown</SelectItem>
                <SelectItem value="txt">Plain text</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </Card>

        <Card title="Notifications">
          <Row label="Toast notifications">
            <Switch
              checked={s.notifications}
              onCheckedChange={(v) => update("notifications", v)}
            />
          </Row>
        </Card>

        <Card title="Data Management">
          <Row label="Clear all saved history">
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Permanently delete all saved AI outputs?")) {
                  clearHistory();
                  toast.success("History cleared");
                }
              }}
            >
              Clear history
            </Button>
          </Row>
        </Card>
      </div>
    </AppShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}
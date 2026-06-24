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
import { Slider } from "@/components/ui/slider";
import { loadSettings, saveSettings, defaultSettings, clearHistory, creativityToTemperature, type AppSettings } from "@/lib/storage";
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
          <Row label="Voice / persona">
            <Select
              value={s.persona}
              onValueChange={(v) => update("persona", v as AppSettings["persona"])}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="neutral">Neutral pro</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Formatting style">
            <Select
              value={s.formatStyle}
              onValueChange={(v) => update("formatStyle", v as AppSettings["formatStyle"])}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plain">Plain prose</SelectItem>
                <SelectItem value="bulleted">Bulleted</SelectItem>
                <SelectItem value="structured">Structured (headings)</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Creativity</Label>
              <span className="text-xs text-muted-foreground">
                {s.creativity}% · temp {creativityToTemperature(s.creativity)}
              </span>
            </div>
            <Slider
              value={[s.creativity]}
              min={0}
              max={100}
              step={5}
              onValueChange={(v) => update("creativity", v[0])}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Precise</span><span>Balanced</span><span>Inventive</span>
            </div>
          </div>
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
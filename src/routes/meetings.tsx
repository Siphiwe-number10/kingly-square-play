import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { OutputPanel } from "@/components/OutputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Wand2, Eraser } from "lucide-react";
import { toast } from "sonner";
import { generateAI } from "@/lib/ai.functions";
import { loadSettings, saveHistoryItem } from "@/lib/storage";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Productivity Hub" },
      {
        name: "description",
        content:
          "Turn long meeting notes into summaries, decisions, action items, deadlines, and owners.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer" },
      {
        property: "og:description",
        content:
          "Turn long meeting notes into summaries, decisions, action items, deadlines, and owners.",
      },
    ],
  }),
  component: MeetingPage,
});

function MeetingPage() {
  const ai = useServerFn(generateAI);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setTitle("");
    setNotes("");
    setOutput("");
  };

  const run = async () => {
    if (!notes.trim()) {
      toast.error("Paste meeting notes or a transcript to summarize.");
      return;
    }
    setLoading(true);
    try {
      const s = loadSettings();
      const res = await ai({
        data: {
          kind: "meeting",
          title,
          notes,
          settings: {
            responseLength: s.responseLength,
            persona: s.persona,
            formatStyle: s.formatStyle,
            creativity: s.creativity,
          },
        },
      });
      setOutput(res.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setLoading(false);
    }
  };

  const save = () => {
    if (!output) return;
    saveHistoryItem({
      module: "meetings",
      title: title.slice(0, 80) || "Meeting summary",
      input: notes,
      output,
    });
    toast.success("Saved to history");
  };

  return (
    <AppShell title="Meeting Notes Summarizer" subtitle="Decisions, actions, and owners — extracted">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <ClipboardList className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Meeting Input</h2>
              <p className="text-xs text-muted-foreground">
                Paste raw notes or a transcript.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Meeting Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Roadmap Review"
                maxLength={150}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Notes / Transcript</Label>
              <Textarea
                rows={14}
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 18000))}
                placeholder="Paste the full meeting notes or transcript here..."
              />
              <span className="text-[11px] text-muted-foreground">
                {notes.length.toLocaleString()}/18,000 characters
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={run} disabled={loading}>
                <Wand2 className="mr-2 h-4 w-4" />
                {loading ? "Summarizing..." : "Summarize Meeting"}
              </Button>
              <Button variant="outline" onClick={reset} disabled={loading}>
                <Eraser className="mr-2 h-4 w-4" /> Clear
              </Button>
            </div>
          </div>
        </section>

        <OutputPanel
          title="Meeting Report"
          text={output}
          loading={loading}
          onRegenerate={run}
          onSave={save}
          filename="meeting-report.md"
          emptyHint="Your structured meeting report will appear here."
          module="meetings"
          shareTitle={title || "Meeting summary"}
        />
      </div>
    </AppShell>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { OutputPanel } from "@/components/OutputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Wand2, Eraser } from "lucide-react";
import { toast } from "sonner";
import { generateAI } from "@/lib/ai.functions";
import { loadSettings, lengthHint, personaHint, formatHint, creativityToTemperature, saveHistoryItem } from "@/lib/storage";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI Productivity Hub" },
      {
        name: "description",
        content:
          "Summarize articles and research with executive summary, insights, recommendations, and risk analysis.",
      },
      { property: "og:title", content: "AI Research Assistant" },
      {
        property: "og:description",
        content:
          "Summarize articles and research with executive summary, insights, recommendations, and risk analysis.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const ai = useServerFn(generateAI);
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setTopic("");
    setContent("");
    setOutput("");
  };

  const run = async () => {
    if (!content.trim() && !topic.trim()) {
      toast.error("Provide a topic or paste content to analyze.");
      return;
    }
    setLoading(true);
    try {
      const s = loadSettings();
      const system =
        "You are a senior research analyst. Return a structured Markdown report with these exact section headers in this order: " +
        "## Executive Summary, ## Key Findings, ## Insights, ## Recommendations, ## Future Considerations, ## Risk Analysis. " +
        "Use concise bullet points where natural. " +
        lengthHint(s.responseLength) + " " + personaHint(s.persona) + " " + formatHint(s.formatStyle);
      const prompt =
        `Research topic: ${topic || "(derive from content)"}\n\n` +
        `Source content / notes:\n${content || "(none provided — use general knowledge about the topic above)"}`;
      const res = await ai({ data: { system, prompt, maxTokens: 3000, temperature: creativityToTemperature(s.creativity) } });
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
      module: "research",
      title: topic.slice(0, 80) || "Research summary",
      input: `Topic: ${topic}\n\n${content}`,
      output,
    });
    toast.success("Saved to history");
  };

  return (
    <AppShell title="AI Research Assistant" subtitle="Summarize and analyze any content">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Research Input</h2>
              <p className="text-xs text-muted-foreground">
                Paste an article, notes, or describe a topic.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Research Topic</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Impact of AI on customer support"
                maxLength={200}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Content to Analyze</Label>
              <Textarea
                rows={14}
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 18000))}
                placeholder="Paste article, paper, or notes..."
              />
              <span className="text-[11px] text-muted-foreground">
                {content.length.toLocaleString()}/18,000 characters
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={run} disabled={loading}>
                <Wand2 className="mr-2 h-4 w-4" />
                {loading ? "Analyzing..." : "Summarize & Analyze"}
              </Button>
              <Button variant="outline" onClick={reset} disabled={loading}>
                <Eraser className="mr-2 h-4 w-4" /> Clear
              </Button>
            </div>
          </div>
        </section>

        <OutputPanel
          title="Research Report"
          text={output}
          loading={loading}
          onRegenerate={run}
          onSave={save}
          filename="research-report.md"
          emptyHint="Your structured research report will appear here."
        />
      </div>
    </AppShell>
  );
}
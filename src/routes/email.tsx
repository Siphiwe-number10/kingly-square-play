import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { OutputPanel } from "@/components/OutputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Wand2, Eraser } from "lucide-react";
import { toast } from "sonner";
import { generateAI } from "@/lib/ai.functions";
import { loadSettings, lengthHint, personaHint, formatHint, creativityToTemperature, saveHistoryItem } from "@/lib/storage";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Productivity Hub" },
      {
        name: "description",
        content: "Generate professional, tone-tuned emails with AI in seconds.",
      },
      { property: "og:title", content: "Smart Email Generator" },
      {
        property: "og:description",
        content: "Generate professional, tone-tuned emails with AI in seconds.",
      },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive", "Professional", "Appreciative", "Apologetic"];
const LENGTHS = ["Short", "Medium", "Long"];

function EmailPage() {
  const ai = useServerFn(generateAI);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [purpose, setPurpose] = useState("");
  const [points, setPoints] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName("");
    setPosition("");
    setPurpose("");
    setPoints("");
    setTone("Professional");
    setLength("Medium");
    setOutput("");
  };

  const run = async () => {
    if (!purpose.trim()) {
      toast.error("Please enter an email purpose.");
      return;
    }
    setLoading(true);
    try {
      const s = loadSettings();
      const system =
        "You are an expert business email writer. Always produce a complete, well-structured email with these clearly labeled sections on separate lines: Subject:, Greeting:, Body:, Call to Action:, Closing:. " +
        lengthHint(s.responseLength) + " " + personaHint(s.persona) + " " + formatHint(s.formatStyle);
      const prompt =
        `Compose an email with tone "${tone}" and length "${length}".\n` +
        `Recipient name: ${name || "(unspecified)"}\n` +
        `Recipient position: ${position || "(unspecified)"}\n` +
        `Purpose: ${purpose}\n` +
        `Key points:\n${points || "(none provided)"}`;
      const res = await ai({ data: { system, prompt, temperature: creativityToTemperature(s.creativity) } });
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
      module: "email",
      title: purpose.slice(0, 80) || "Untitled email",
      input: `To: ${name} (${position})\nPurpose: ${purpose}\nTone: ${tone} • Length: ${length}\nKey points: ${points}`,
      output,
    });
    toast.success("Saved to history");
  };

  return (
    <AppShell title="Smart Email Generator" subtitle="Draft polished emails in seconds">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Email Details</h2>
              <p className="text-xs text-muted-foreground">Fill the form to generate your email.</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Recipient Name">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah Chen" maxLength={120} />
              </Field>
              <Field label="Recipient Position">
                <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Head of Marketing" maxLength={120} />
              </Field>
            </div>
            <Field label="Email Purpose" hint="What is this email about?">
              <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Follow up on partnership proposal" maxLength={200} />
            </Field>
            <Field
              label="Key Points"
              hint={`${points.length}/1500 characters`}
            >
              <Textarea
                rows={5}
                value={points}
                onChange={(e) => setPoints(e.target.value.slice(0, 1500))}
                placeholder="Bullet the key things to mention..."
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tone">
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Length">
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LENGTHS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={run} disabled={loading}>
                <Wand2 className="mr-2 h-4 w-4" />
                {loading ? "Generating..." : "Generate Email"}
              </Button>
              <Button variant="outline" onClick={reset} disabled={loading}>
                <Eraser className="mr-2 h-4 w-4" /> Clear
              </Button>
            </div>
          </div>
        </section>

        <OutputPanel
          title="Generated Email"
          text={output}
          loading={loading}
          onRegenerate={run}
          onSave={save}
          filename="email.txt"
          emptyHint="Your AI-drafted email will appear here."
          module="email"
          shareTitle={purpose || "Generated email"}
        />
      </div>
    </AppShell>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  );
}
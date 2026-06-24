import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ResponseLength = z.enum(["short", "medium", "long"]);
const Persona = z.enum(["neutral", "executive", "friendly", "academic", "creative"]);
const FormatStyle = z.enum(["plain", "bulleted", "structured"]);

const SettingsInput = z.object({
  responseLength: ResponseLength.default("medium"),
  persona: Persona.default("neutral"),
  formatStyle: FormatStyle.default("structured"),
  creativity: z.number().min(0).max(100).default(50),
});

const EmailInput = z.object({
  kind: z.literal("email"),
  name: z.string().max(120).optional().default(""),
  position: z.string().max(120).optional().default(""),
  purpose: z.string().min(1).max(400),
  points: z.string().max(2000).optional().default(""),
  tone: z.enum(["Formal", "Friendly", "Persuasive", "Professional", "Appreciative", "Apologetic"]),
  length: z.enum(["Short", "Medium", "Long"]),
  settings: SettingsInput,
});

const ResearchInput = z.object({
  kind: z.literal("research"),
  topic: z.string().max(400).optional().default(""),
  content: z.string().max(20000).optional().default(""),
  settings: SettingsInput,
});

const MeetingInput = z.object({
  kind: z.literal("meeting"),
  title: z.string().max(200).optional().default(""),
  notes: z.string().min(1).max(20000),
  settings: SettingsInput,
});

const Input = z.discriminatedUnion("kind", [EmailInput, ResearchInput, MeetingInput]);
type ParsedInput = z.infer<typeof Input>;

function lengthSpec(s: z.infer<typeof ResponseLength>) {
  if (s === "short") {
    return {
      hint: "STRICT LENGTH REQUIREMENT: The total response MUST be between 80 and 150 words. Do not exceed 150 words under any circumstances. Be concise and omit non-essential detail.",
      maxTokens: 350,
    };
  }
  if (s === "long") {
    return {
      hint: "STRICT LENGTH REQUIREMENT: The total response MUST be between 500 and 800 words. Be thorough and detailed, expanding each section.",
      maxTokens: 1800,
    };
  }
  return {
    hint: "STRICT LENGTH REQUIREMENT: The total response MUST be between 200 and 320 words. Keep it balanced — neither terse nor exhaustive.",
    maxTokens: 800,
  };
}

// Map the email-specific length control to the same response-length scale.
function emailLengthToResponseLength(l: "Short" | "Medium" | "Long"): z.infer<typeof ResponseLength> {
  if (l === "Short") return "short";
  if (l === "Long") return "long";
  return "medium";
}
function personaHint(p: z.infer<typeof Persona>) {
  switch (p) {
    case "executive": return "Write with an executive, decisive tone. Lead with the bottom line.";
    case "friendly": return "Use a warm, conversational tone with approachable language.";
    case "academic": return "Use a precise, formal, citation-friendly academic tone.";
    case "creative": return "Use an imaginative, vivid, engaging tone.";
    default: return "Use a clear, neutral professional tone.";
  }
}
function formatHint(f: z.infer<typeof FormatStyle>) {
  switch (f) {
    case "bulleted": return "Prefer concise bullet lists where useful.";
    case "structured": return "Use clear headings and short paragraphs for readability.";
    default: return "Write flowing paragraphs without headings.";
  }
}
function creativityToTemperature(c: number) {
  const t = 0.1 + (Math.max(0, Math.min(100, c)) / 100) * 1.1;
  return Math.round(t * 100) / 100;
}

function buildRequest(data: ParsedInput): { system: string; prompt: string; maxTokens: number } {
  const s = data.settings;
  // For emails the user picks a length directly on the form — honor that over the global setting.
  const effectiveLength =
    data.kind === "email" ? emailLengthToResponseLength(data.length) : s.responseLength;
  const lenSpec = lengthSpec(effectiveLength);
  const tail = ` ${lenSpec.hint} ${personaHint(s.persona)} ${formatHint(s.formatStyle)}`;
  if (data.kind === "email") {
    const system =
      "You are an expert business email writer. Always produce a complete, well-structured email with these clearly labeled sections on separate lines: Subject:, Greeting:, Body:, Call to Action:, Closing:." + tail;
    const prompt =
      `Compose an email with tone "${data.tone}" and length "${data.length}".\n` +
      `Recipient name: ${data.name || "(unspecified)"}\n` +
      `Recipient position: ${data.position || "(unspecified)"}\n` +
      `Purpose: ${data.purpose}\n` +
      `Key points:\n${data.points || "(none provided)"}`;
    return { system, prompt, maxTokens: lenSpec.maxTokens };
  }
  if (data.kind === "research") {
    const system =
      "You are a senior research analyst. Return a structured Markdown report with these exact section headers in this order: " +
      "## Executive Summary, ## Key Findings, ## Insights, ## Recommendations, ## Future Considerations, ## Risk Analysis. " +
      "Use concise bullet points where natural." + tail;
    const prompt =
      `Research topic: ${data.topic || "(derive from content)"}\n\n` +
      `Source content / notes:\n${data.content || "(none provided — use general knowledge about the topic above)"}`;
    return { system, prompt, maxTokens: lenSpec.maxTokens };
  }
  const system =
    "You are an expert meeting facilitator. Produce a structured Markdown report with these exact headers in order: " +
    "## Meeting Summary, ## Key Discussion Points, ## Decisions Made, ## Action Items, ## Deadlines, ## Responsible Individuals. " +
    "Under Action Items use bullets formatted as: - [Owner] Task (Due: date if known)." + tail;
  const prompt = `Meeting title: ${data.title || "(untitled)"}\n\nRaw notes / transcript:\n${data.notes}`;
  return { system, prompt, maxTokens: lenSpec.maxTokens };
}

export const generateAI = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY on server.");

    const { system, prompt, maxTokens } = buildRequest(data);
    const temperature = creativityToTemperature(data.settings.creativity);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("AI gateway error", res.status, text.slice(0, 500));
      if (res.status === 429)
        throw new Error("AI is rate-limited right now. Please try again in a moment.");
      if (res.status === 402)
        throw new Error("AI credits exhausted. Add credits to your Lovable workspace to continue.");
      throw new Error("AI request failed. Please try again later.");
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    return { text: content };
  });
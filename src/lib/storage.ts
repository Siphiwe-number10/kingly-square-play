export type ModuleKind = "email" | "research" | "meetings";

export interface HistoryItem {
  id: string;
  module: ModuleKind;
  title: string;
  input: string;
  output: string;
  createdAt: number;
}

const HISTORY_KEY = "aih.history.v1";
const SETTINGS_KEY = "aih.settings.v1";
const PROFILE_KEY = "aih.profile.v1";

export interface AppSettings {
  theme: "light" | "dark";
  responseLength: "short" | "medium" | "long";
  exportFormat: "txt" | "md";
  notifications: boolean;
  creativity: number; // 0-100 → maps to temperature
  persona: "neutral" | "executive" | "friendly" | "academic" | "creative";
  formatStyle: "plain" | "bulleted" | "structured";
}

export const defaultSettings: AppSettings = {
  theme: "light",
  responseLength: "medium",
  exportFormat: "md",
  notifications: true,
  creativity: 50,
  persona: "neutral",
  formatStyle: "structured",
};

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  bio: string;
  avatarColor: string;
}

export const defaultProfile: UserProfile = {
  name: "",
  email: "",
  role: "",
  bio: "",
  avatarColor: "#6366f1",
};

export function loadProfile(): UserProfile {
  return { ...defaultProfile, ...safeRead<Partial<UserProfile>>(PROFILE_KEY, {}) };
}

export function saveProfile(p: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("aih:profile"));
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadHistory(): HistoryItem[] {
  return safeRead<HistoryItem[]>(HISTORY_KEY, []);
}

export function saveHistoryItem(item: Omit<HistoryItem, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  const list = loadHistory();
  const full: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  list.unshift(full);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 200)));
  window.dispatchEvent(new Event("aih:history"));
  return full;
}

export function deleteHistoryItem(id: string) {
  if (typeof window === "undefined") return;
  const list = loadHistory().filter((i) => i.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("aih:history"));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
  window.dispatchEvent(new Event("aih:history"));
}

export function loadSettings(): AppSettings {
  return { ...defaultSettings, ...safeRead<Partial<AppSettings>>(SETTINGS_KEY, {}) };
}

export function saveSettings(s: AppSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("aih:settings"));
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function lengthHint(s: AppSettings["responseLength"]) {
  if (s === "short") return "Keep it concise — under 150 words.";
  if (s === "long") return "Be thorough and detailed — 400-700 words.";
  return "Aim for a balanced length — around 250 words.";
}

export function personaHint(p: AppSettings["persona"]) {
  switch (p) {
    case "executive": return "Write with an executive, decisive tone. Lead with the bottom line.";
    case "friendly": return "Use a warm, conversational tone with approachable language.";
    case "academic": return "Use a precise, formal, citation-friendly academic tone.";
    case "creative": return "Use an imaginative, vivid, engaging tone.";
    default: return "Use a clear, neutral professional tone.";
  }
}

export function formatHint(f: AppSettings["formatStyle"]) {
  switch (f) {
    case "bulleted": return "Prefer concise bullet lists where useful.";
    case "structured": return "Use clear headings and short paragraphs for readability.";
    default: return "Write flowing paragraphs without headings.";
  }
}

export function creativityToTemperature(c: number) {
  // 0..100 → 0.1..1.2
  const t = 0.1 + (Math.max(0, Math.min(100, c)) / 100) * 1.1;
  return Math.round(t * 100) / 100;
}

export function buildShareUrl(payload: { title: string; module: ModuleKind; output: string }) {
  if (typeof window === "undefined") return "";
  const json = JSON.stringify(payload);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return `${window.location.origin}/share#${b64}`;
}

export function decodeShareHash(hash: string) {
  try {
    const raw = hash.startsWith("#") ? hash.slice(1) : hash;
    if (!raw) return null;
    const json = decodeURIComponent(escape(atob(raw)));
    return JSON.parse(json) as { title: string; module: ModuleKind; output: string };
  } catch {
    return null;
  }
}
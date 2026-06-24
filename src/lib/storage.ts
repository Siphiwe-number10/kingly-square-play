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

export interface AppSettings {
  theme: "light" | "dark";
  responseLength: "short" | "medium" | "long";
  exportFormat: "txt" | "md";
  notifications: boolean;
}

export const defaultSettings: AppSettings = {
  theme: "light",
  responseLength: "medium",
  exportFormat: "md",
  notifications: true,
};

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
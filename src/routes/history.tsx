import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  clearHistory,
  deleteHistoryItem,
  downloadText,
  loadHistory,
  type HistoryItem,
  type ModuleKind,
} from "@/lib/storage";
import { Mail, BookOpen, ClipboardList, Trash2, Copy, Download, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — AI Productivity Hub" },
      { name: "description", content: "Browse and reuse your previous AI outputs." },
    ],
  }),
  component: HistoryPage,
});

const FILTERS: Array<{ key: "all" | ModuleKind; label: string }> = [
  { key: "all", label: "All" },
  { key: "email", label: "Email" },
  { key: "research", label: "Research" },
  { key: "meetings", label: "Meetings" },
];

function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<"all" | ModuleKind>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    const sync = () => setItems(loadHistory());
    sync();
    window.addEventListener("aih:history", sync);
    return () => window.removeEventListener("aih:history", sync);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((i) => {
      if (filter !== "all" && i.module !== filter) return false;
      if (!term) return true;
      return (
        i.title.toLowerCase().includes(term) ||
        i.input.toLowerCase().includes(term) ||
        i.output.toLowerCase().includes(term)
      );
    });
  }, [items, filter, q]);

  return (
    <AppShell title="History" subtitle="Your saved AI outputs">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search history..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Clear all history?")) clearHistory();
            }}
          >
            <Trash2 className="mr-1 h-4 w-4" /> Clear all
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
            No history yet. Generate something from one of the tools.
          </div>
        ) : (
          filtered.map((h) => (
            <article
              key={h.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <header className="mb-3 flex flex-wrap items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  {h.module === "email" && <Mail className="h-4 w-4" />}
                  {h.module === "research" && <BookOpen className="h-4 w-4" />}
                  {h.module === "meetings" && <ClipboardList className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{h.title}</div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {h.module} • {new Date(h.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(h.output);
                      toast.success("Copied");
                    }}
                  >
                    <Copy className="mr-1 h-4 w-4" /> Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadText(`${h.module}-${h.id}.txt`, h.output)}
                  >
                    <Download className="mr-1 h-4 w-4" /> Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      deleteHistoryItem(h.id);
                      toast.success("Deleted");
                    }}
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </Button>
                </div>
              </header>
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-xs leading-relaxed">
                {h.output}
              </pre>
            </article>
          ))
        )}
      </div>
    </AppShell>
  );
}
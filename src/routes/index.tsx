import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Mail, BookOpen, ClipboardList, Sparkles, TrendingUp, Clock } from "lucide-react";
import { loadHistory, type HistoryItem } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Productivity Hub — Dashboard" },
      {
        name: "description",
        content:
          "Unified AI productivity platform with email generation, research summaries, and meeting notes analysis.",
      },
      { property: "og:title", content: "AI Productivity Hub — Dashboard" },
      {
        property: "og:description",
        content: "Email generation, research summaries, and meeting summarization in one place.",
      },
    ],
  }),
  component: Dashboard,
});

const QUICK = [
  {
    to: "/email",
    title: "Smart Email Generator",
    desc: "Draft professional, tone-tuned emails in seconds.",
    icon: Mail,
    accent: "from-blue-500/20 to-indigo-500/10",
  },
  {
    to: "/research",
    title: "AI Research Assistant",
    desc: "Summarize articles, extract insights & recommendations.",
    icon: BookOpen,
    accent: "from-emerald-500/20 to-teal-500/10",
  },
  {
    to: "/meetings",
    title: "Meeting Notes Summarizer",
    desc: "Turn long notes into decisions, actions & owners.",
    icon: ClipboardList,
    accent: "from-amber-500/20 to-orange-500/10",
  },
] as const;

function Dashboard() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const sync = () => setHistory(loadHistory());
    sync();
    window.addEventListener("aih:history", sync);
    return () => window.removeEventListener("aih:history", sync);
  }, []);

  const counts = {
    email: history.filter((h) => h.module === "email").length,
    research: history.filter((h) => h.module === "research").length,
    meetings: history.filter((h) => h.module === "meetings").length,
  };
  const recent = history.slice(0, 5);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <AppShell title="Dashboard" subtitle="Your AI productivity overview">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold sm:text-2xl">{greet} 👋</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You've generated <span className="font-semibold text-foreground">{history.length}</span>{" "}
              AI outputs so far. Pick a tool below to keep the momentum going.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Emails Generated" value={counts.email} icon={Mail} />
        <Stat label="Research Summaries" value={counts.research} icon={BookOpen} />
        <Stat label="Meeting Notes" value={counts.meetings} icon={ClipboardList} />
      </section>

      <section className="mt-8">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Quick Access</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {QUICK.map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.to}
                to={q.to}
                className={
                  "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                }
              >
                <div
                  className={"absolute inset-0 bg-gradient-to-br opacity-60 " + q.accent}
                  aria-hidden
                />
                <div className="relative">
                  <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-background/80 backdrop-blur">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-base font-semibold">{q.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{q.desc}</p>
                  <span className="mt-3 inline-flex text-xs font-medium text-primary group-hover:underline">
                    Open tool →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">Recent Activity</h3>
          <Link to="/history" className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center text-sm text-muted-foreground">
              <TrendingUp className="h-6 w-6" />
              <p>No activity yet. Generate your first email, summary, or meeting notes.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted">
                    {r.module === "email" && <Mail className="h-4 w-4" />}
                    {r.module === "research" && <BookOpen className="h-4 w-4" />}
                    {r.module === "meetings" && <ClipboardList className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{r.title}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Mail;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold">{value}</div>
        <div className="truncate text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
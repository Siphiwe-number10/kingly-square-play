import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { decodeShareHash } from "@/lib/storage";
import { Copy, Sparkles, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/share")({
  head: () => ({
    meta: [
      { title: "Shared AI Output — AI Productivity Hub" },
      { name: "description", content: "View an AI-generated output shared with you." },
    ],
  }),
  component: SharePage,
});

function SharePage() {
  const [data, setData] = useState<ReturnType<typeof decodeShareHash>>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(decodeShareHash(window.location.hash));
    setReady(true);
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <AppShell title="Shared Output" subtitle="A snapshot generated with AI Productivity Hub">
      <div className="mx-auto max-w-3xl">
        {!ready ? null : !data ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No shared content found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This link is empty or invalid. Generate something and share it!
            </p>
            <div className="mt-4">
              <Link to="/" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
                Go to dashboard
              </Link>
            </div>
          </div>
        ) : (
          <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-gradient-to-r from-primary/10 to-transparent px-6 py-4">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  {data.module}
                </div>
                <h1 className="truncate text-base font-bold">{data.title}</h1>
              </div>
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="mr-2 h-4 w-4" /> Copy link
              </Button>
            </header>
            <div className="p-6">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">
                {data.output}
              </pre>
            </div>
            <footer className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <LinkIcon className="h-3 w-3" /> Shared via AI Productivity Hub
              </span>
              <Link to="/" className="font-medium text-primary hover:underline">Try it yourself →</Link>
            </footer>
          </article>
        )}
      </div>
    </AppShell>
  );
}
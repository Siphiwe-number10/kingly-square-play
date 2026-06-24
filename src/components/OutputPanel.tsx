import { Button } from "@/components/ui/button";
import { Copy, Download, RefreshCw, Save, Share2 } from "lucide-react";
import { toast } from "sonner";
import { downloadText, buildShareUrl, type ModuleKind } from "@/lib/storage";
import { QuizGame } from "./QuizGame";

export function OutputPanel({
  title,
  text,
  loading,
  onRegenerate,
  onSave,
  filename,
  emptyHint,
  module,
  shareTitle,
}: {
  title: string;
  text: string;
  loading?: boolean;
  onRegenerate?: () => void;
  onSave?: () => void;
  filename: string;
  emptyHint: string;
  module?: ModuleKind;
  shareTitle?: string;
}) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const share = async () => {
    if (!text || !module) return;
    const url = buildShareUrl({ title: shareTitle || title, module, output: text });
    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle || title, url });
        return;
      }
    } catch {
      /* fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard");
    } catch {
      toast.error("Could not create share link");
    }
  };

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
        <h2 className="truncate text-sm font-semibold">{title}</h2>
        <div className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" size="sm" disabled={!text} onClick={copy}>
            <Copy className="mr-1 h-4 w-4" /> Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!text}
            onClick={() => downloadText(filename, text)}
          >
            <Download className="mr-1 h-4 w-4" /> Download
          </Button>
          {module && (
            <Button variant="ghost" size="sm" disabled={!text} onClick={share}>
              <Share2 className="mr-1 h-4 w-4" /> Share
            </Button>
          )}
          {onSave && (
            <Button variant="ghost" size="sm" disabled={!text} onClick={onSave}>
              <Save className="mr-1 h-4 w-4" /> Save
            </Button>
          )}
          {onRegenerate && (
            <Button variant="ghost" size="sm" disabled={loading} onClick={onRegenerate}>
              <RefreshCw className={"mr-1 h-4 w-4 " + (loading ? "animate-spin" : "")} />
              Regenerate
            </Button>
          )}
        </div>
      </header>
      <div className="min-h-[320px] flex-1 overflow-auto p-5">
        {loading ? (
          <div className="flex h-full flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Generating with AI… meanwhile, try a quick quiz:
            </div>
            <QuizGame />
          </div>
        ) : text ? (
          <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">
            {text}
          </pre>
        ) : (
          <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
            {emptyHint}
          </div>
        )}
      </div>
    </section>
  );
}
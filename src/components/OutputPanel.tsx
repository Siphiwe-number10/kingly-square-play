import { Button } from "@/components/ui/button";
import { Copy, Download, RefreshCw, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadText } from "@/lib/storage";

export function OutputPanel({
  title,
  text,
  loading,
  onRegenerate,
  onSave,
  filename,
  emptyHint,
}: {
  title: string;
  text: string;
  loading?: boolean;
  onRegenerate?: () => void;
  onSave?: () => void;
  filename: string;
  emptyHint: string;
}) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
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
      <div className="min-h-[280px] flex-1 overflow-auto p-5">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating with AI...
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
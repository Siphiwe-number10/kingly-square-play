export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p
      className={
        "mt-6 rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground " +
        className
      }
    >
      <span className="font-semibold text-foreground">Responsible AI:</span>{" "}
      AI-generated content is intended to assist users and may contain inaccuracies,
      omissions, or biases. Users should verify important information before making
      decisions. This platform does not replace professional advice, expertise, or
      human judgment.
    </p>
  );
}
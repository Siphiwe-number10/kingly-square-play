import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { pickQuiz, type QuizQ } from "@/lib/quiz";
import { Gamepad2, Check, X, Sparkles, RotateCcw } from "lucide-react";

export function QuizGame({ compact = false }: { compact?: boolean }) {
  const [round, setRound] = useState(0);
  const [questions, setQuestions] = useState<QuizQ[]>(() => pickQuiz(5));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const q = questions[i];
  const done = i >= questions.length;

  const reset = () => {
    setQuestions(pickQuiz(5));
    setI(0);
    setPicked(null);
    setScore(0);
    setRound((r) => r + 1);
  };

  const choose = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    setPicked(null);
    setI((n) => n + 1);
  };

  const progress = useMemo(() => ((done ? questions.length : i) / questions.length) * 100, [i, done, questions.length]);

  return (
    <div className={"flex w-full flex-col gap-4 rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 " + (compact ? "" : "shadow-sm")} key={round}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Gamepad2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Quick Quiz</div>
            <div className="text-[11px] text-muted-foreground">Have some fun while AI is thinking…</div>
          </div>
        </div>
        <div className="text-xs font-medium text-muted-foreground">
          Score <span className="text-foreground">{score}</span>/{questions.length}
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      {done ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="text-base font-semibold">
            You scored {score} / {questions.length}
          </div>
          <p className="text-xs text-muted-foreground">
            {score === questions.length ? "Flawless!" : score >= questions.length / 2 ? "Nice work!" : "Try again — sharpen those neurons."}
          </p>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" /> Play again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium">
            <span className="mr-2 text-xs font-semibold text-primary">Q{i + 1}.</span>
            {q.q}
          </div>
          <div className="grid gap-2">
            {q.choices.map((c, idx) => {
              const isCorrect = picked !== null && idx === q.answer;
              const isWrongPick = picked === idx && picked !== q.answer;
              return (
                <button
                  key={idx}
                  onClick={() => choose(idx)}
                  disabled={picked !== null}
                  className={
                    "group flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-all " +
                    (isCorrect
                      ? "border-emerald-500/40 bg-emerald-500/10 text-foreground"
                      : isWrongPick
                        ? "border-rose-500/40 bg-rose-500/10 text-foreground"
                        : "border-border bg-background hover:border-primary/40 hover:bg-accent")
                  }
                >
                  <span className="truncate">{c}</span>
                  {isCorrect && <Check className="h-4 w-4 text-emerald-600" />}
                  {isWrongPick && <X className="h-4 w-4 text-rose-600" />}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="text-[11px] text-muted-foreground">
                {picked === q.answer ? "Correct! " : "Not quite. "}
                {q.fact ?? ""}
              </div>
              <Button size="sm" onClick={next}>
                {i + 1 >= questions.length ? "See score" : "Next"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
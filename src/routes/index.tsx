import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chess Gameboard" },
      { name: "description", content: "Play chess locally on a beautiful interactive board." },
      { property: "og:title", content: "Chess Gameboard" },
      { property: "og:description", content: "Play chess locally on a beautiful interactive board." },
    ],
  }),
  component: Index,
});

type Piece = {
  type: "k" | "q" | "r" | "b" | "n" | "p";
  color: "w" | "b";
};
type Board = (Piece | null)[][];

const GLYPHS: Record<string, string> = {
  wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
  bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
};

function initialBoard(): Board {
  const empty: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
  const back: Piece["type"][] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  for (let i = 0; i < 8; i++) {
    empty[0][i] = { type: back[i], color: "b" };
    empty[1][i] = { type: "p", color: "b" };
    empty[6][i] = { type: "p", color: "w" };
    empty[7][i] = { type: back[i], color: "w" };
  }
  return empty;
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

function inBounds(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function pieceMoves(board: Board, r: number, c: number): [number, number][] {
  const p = board[r][c];
  if (!p) return [];
  const moves: [number, number][] = [];
  const enemy = p.color === "w" ? "b" : "w";

  const slide = (dirs: [number, number][]) => {
    for (const [dr, dc] of dirs) {
      let nr = r + dr, nc = c + dc;
      while (inBounds(nr, nc)) {
        const t = board[nr][nc];
        if (!t) moves.push([nr, nc]);
        else {
          if (t.color === enemy) moves.push([nr, nc]);
          break;
        }
        nr += dr; nc += dc;
      }
    }
  };

  const step = (offs: [number, number][]) => {
    for (const [dr, dc] of offs) {
      const nr = r + dr, nc = c + dc;
      if (!inBounds(nr, nc)) continue;
      const t = board[nr][nc];
      if (!t || t.color === enemy) moves.push([nr, nc]);
    }
  };

  switch (p.type) {
    case "p": {
      const dir = p.color === "w" ? -1 : 1;
      const startRow = p.color === "w" ? 6 : 1;
      if (inBounds(r + dir, c) && !board[r + dir][c]) {
        moves.push([r + dir, c]);
        if (r === startRow && !board[r + 2 * dir][c]) moves.push([r + 2 * dir, c]);
      }
      for (const dc of [-1, 1]) {
        const nr = r + dir, nc = c + dc;
        if (inBounds(nr, nc) && board[nr][nc] && board[nr][nc]!.color === enemy) {
          moves.push([nr, nc]);
        }
      }
      break;
    }
    case "n":
      step([[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]);
      break;
    case "b":
      slide([[-1,-1],[-1,1],[1,-1],[1,1]]);
      break;
    case "r":
      slide([[-1,0],[1,0],[0,-1],[0,1]]);
      break;
    case "q":
      slide([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]);
      break;
    case "k":
      step([[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]);
      break;
  }
  return moves;
}

function Index() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [turn, setTurn] = useState<"w" | "b">("w");
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [captured, setCaptured] = useState<Piece[]>([]);

  const legal = useMemo(() => {
    if (!selected) return new Set<string>();
    return new Set(pieceMoves(board, selected[0], selected[1]).map(([r, c]) => `${r},${c}`));
  }, [selected, board]);

  const onSquare = (r: number, c: number) => {
    const p = board[r][c];
    if (selected) {
      const [sr, sc] = selected;
      if (sr === r && sc === c) { setSelected(null); return; }
      if (legal.has(`${r},${c}`)) {
        const next = board.map((row) => row.slice());
        const moving = next[sr][sc]!;
        const target = next[r][c];
        if (target) setCaptured((cap) => [...cap, target]);
        // simple promotion
        if (moving.type === "p" && (r === 0 || r === 7)) {
          next[r][c] = { type: "q", color: moving.color };
        } else {
          next[r][c] = moving;
        }
        next[sr][sc] = null;
        setBoard(next);
        setSelected(null);
        setTurn(turn === "w" ? "b" : "w");
        return;
      }
      if (p && p.color === turn) { setSelected([r, c]); return; }
      setSelected(null);
      return;
    }
    if (p && p.color === turn) setSelected([r, c]);
  };

  const reset = () => {
    setBoard(initialBoard());
    setTurn("w");
    setSelected(null);
    setCaptured([]);
  };

  const whiteCaps = captured.filter((p) => p.color === "b");
  const blackCaps = captured.filter((p) => p.color === "w");

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <header className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Chess</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {turn === "w" ? "White" : "Black"} to move
            </p>
          </div>
          <button
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            New game
          </button>
        </header>

        <div className="mb-3 flex h-7 items-center gap-1 text-2xl leading-none">
          {blackCaps.map((p, i) => (
            <span key={i}>{GLYPHS[`${p.color}${p.type}`]}</span>
          ))}
        </div>

        <div className="rounded-lg overflow-hidden border border-border shadow-2xl">
          <div className="grid grid-cols-8 aspect-square">
            {board.map((row, r) =>
              row.map((piece, c) => {
                const isLight = (r + c) % 2 === 0;
                const isSelected = selected && selected[0] === r && selected[1] === c;
                const isLegal = legal.has(`${r},${c}`);
                const isCapture = isLegal && !!piece;
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => onSquare(r, c)}
                    className={[
                      "relative flex items-center justify-center text-3xl sm:text-5xl transition-colors",
                      isLight ? "bg-[oklch(0.93_0.03_85)]" : "bg-[oklch(0.45_0.06_50)]",
                      isSelected ? "ring-4 ring-inset ring-[oklch(0.75_0.18_85)]" : "",
                    ].join(" ")}
                  >
                    {piece && (
                      <span
                        className={piece.color === "w" ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]" : "text-black"}
                      >
                        {GLYPHS[`${piece.color}${piece.type}`]}
                      </span>
                    )}
                    {isLegal && !isCapture && (
                      <span className="absolute h-3 w-3 rounded-full bg-[oklch(0.55_0.15_145)/0.55]" />
                    )}
                    {isCapture && (
                      <span className="absolute inset-1 rounded-md ring-4 ring-[oklch(0.6_0.2_25)/0.7]" />
                    )}
                    {c === 0 && (
                      <span className="absolute left-1 top-0.5 text-[10px] font-semibold opacity-60">
                        {8 - r}
                      </span>
                    )}
                    {r === 7 && (
                      <span className="absolute right-1 bottom-0.5 text-[10px] font-semibold opacity-60">
                        {FILES[c]}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-3 flex h-7 items-center gap-1 text-2xl leading-none">
          {whiteCaps.map((p, i) => (
            <span key={i}>{GLYPHS[`${p.color}${p.type}`]}</span>
          ))}
        </div>
      </div>
    </main>
  );
}

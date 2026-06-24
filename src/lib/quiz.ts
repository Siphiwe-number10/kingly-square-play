export interface QuizQ {
  q: string;
  choices: string[];
  answer: number; // index
  fact?: string;
}

export const QUIZ_BANK: QuizQ[] = [
  { q: "What does 'AI' stand for?", choices: ["Automated Input", "Artificial Intelligence", "Algorithmic Internet", "Adaptive Interface"], answer: 1, fact: "Coined by John McCarthy in 1956." },
  { q: "Which planet is closest to the Sun?", choices: ["Venus", "Earth", "Mercury", "Mars"], answer: 2 },
  { q: "Productivity tip: the Pomodoro technique uses intervals of…", choices: ["10 minutes", "25 minutes", "45 minutes", "60 minutes"], answer: 1, fact: "Invented by Francesco Cirillo in the late 1980s." },
  { q: "Which language powers most of the modern web frontend?", choices: ["Python", "Rust", "JavaScript", "Go"], answer: 2 },
  { q: "What is the keyboard shortcut to copy on most systems?", choices: ["Ctrl+V", "Ctrl+C", "Ctrl+X", "Ctrl+Z"], answer: 1 },
  { q: "Who is widely credited as the first computer programmer?", choices: ["Alan Turing", "Ada Lovelace", "Grace Hopper", "Linus Torvalds"], answer: 1, fact: "Ada wrote an algorithm for Babbage's Analytical Engine." },
  { q: "Which sea is the saltiest?", choices: ["Mediterranean", "Dead Sea", "Red Sea", "Caspian"], answer: 1 },
  { q: "A 'meeting that could have been an email' is best summarized as…", choices: ["Necessary", "Productive", "Avoidable", "Mandatory"], answer: 2 },
  { q: "GPT stands for…", choices: ["General Purpose Tool", "Generative Pretrained Transformer", "Graphical Process Tracker", "Global Public Token"], answer: 1 },
  { q: "Which is the largest ocean?", choices: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
  { q: "The 'Eisenhower matrix' sorts tasks by…", choices: ["Cost & time", "Urgency & importance", "People & place", "Effort & mood"], answer: 1 },
  { q: "HTML stands for…", choices: ["Hyperlinks Text Mark Language", "HyperText Markup Language", "Home Tool Markup Language", "Hyperlink Transfer Mode Language"], answer: 1 },
  { q: "Which company created the React library?", choices: ["Google", "Meta", "Microsoft", "Twitter"], answer: 1 },
  { q: "What does 'CC' mean in an email?", choices: ["Common Copy", "Carbon Copy", "Closed Channel", "Confirmed Contact"], answer: 1 },
  { q: "Best length for a subject line, roughly:", choices: ["3-5 words", "6-10 words", "15-20 words", "A full sentence"], answer: 1 },
];

export function pickQuiz(n = 5): QuizQ[] {
  const shuffled = [...QUIZ_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
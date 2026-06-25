# AI Productivity Hub

A unified AI-powered productivity platform that brings three intelligent tools together in one modern dashboard:

- **Smart Email Generator** — Draft professional emails in seconds with tone, length, and purpose controls.
- **AI Research Assistant** — Get structured, well-organized research summaries on any topic.
- **Meeting Notes Summarizer** — Turn raw meeting transcripts into clear summaries, decisions, and action items.

Built for professionals, students, universities, and businesses who want enterprise-grade AI productivity in a clean, fast interface.

---

## Features

- Three AI tools in one dashboard (Email, Research, Meetings)
- Fine-grained response controls — tone, length, format, creativity
- History management — every generation saved and re-openable
- Share links — generate shareable read-only links for any output
- Profile & Settings — personalize defaults, signature, and preferences
- Responsible AI — built-in disclaimer and safe server-side prompt construction
- Fully responsive — mobile, tablet, desktop
- Modern UI — Tailwind CSS v4 + shadcn/ui

---

## Tech Stack

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| Framework   | TanStack Start (React 19 + SSR)               |
| Build tool  | Vite 7                                        |
| Styling     | Tailwind CSS v4 + shadcn/ui                   |
| Routing     | TanStack Router (file-based)                  |
| AI          | Lovable AI Gateway                            |
| Backend     | Lovable Cloud                                 |
| Deployment  | Cloudflare Workers (edge)                     |

---

## Getting Started

### Prerequisites
- Bun or Node.js 20+

### Install & run

```bash
bun install
bun run dev
```

Open http://localhost:8080 in your browser.

### Build for production

```bash
bun run build
```

---

## Project Structure

```
src/
├── components/      # Shared UI (AppShell, OutputPanel, Disclaimer, ...)
│   └── ui/          # shadcn/ui primitives
├── lib/             # AI server functions, storage, utilities
├── routes/          # File-based routes
│   ├── __root.tsx
│   ├── index.tsx    # Dashboard
│   ├── email.tsx
│   ├── research.tsx
│   ├── meetings.tsx
│   ├── history.tsx
│   ├── profile.tsx
│   ├── settings.tsx
│   └── share.tsx
└── styles.css       # Tailwind v4 theme tokens
```

---

## Responsible AI

AI-generated content can be inaccurate or biased. Always review outputs before sending, publishing, or making decisions. Prompts are constructed server-side to protect the AI gateway from misuse.

---

## Deployment

This project is built and deployed via Lovable. When connected to GitHub, changes sync automatically between Lovable and your repository.

- Preview: https://id-preview--b1c410f2-12f2-43a3-8b53-21353d98f90b.lovable.app
- Published: https://kingly-square-play.lovable.app

---

## License

MIT

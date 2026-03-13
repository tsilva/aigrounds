<div align="center">
  <img src="logo.png" alt="aigrounds" width="512"/>

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

  **🧠 Learn AI ideas by poking the algorithm until it explains itself 🔬**

</div>

## Overview

**The Pain:** AI algorithms are explained with math-heavy papers and static diagrams. You read about UCT formulas and backpropagation but never *feel* how they work.

**The Solution:** AI Grounds is a collection of interactive playgrounds where you run algorithms step-by-step, watch trees grow, and see scores update live — all in your browser.

**The Result:** Concepts that took hours to grok from textbooks click in under 10 minutes of hands-on exploration.

## ⚡ Features

- **Interactive simulations** — run algorithms one step at a time or let them play out automatically
- **Live narration** — each phase is explained as it happens (Selection → Expansion → Simulation → Backpropagation)
- **Visual tree rendering** — watch the search tree grow with opacity, color, and path highlighting
- **Adjustable parameters** — tweak exploration constants and see the effect immediately
- **Ranking diagnostics** — inspect BM25 term contributions, IDF, and length normalization side by side
- **Modular architecture** — each AI concept is a self-contained playground, easy to extend
- **Zero backend** — everything runs client-side, no API keys or servers needed

## 🧪 Available Playgrounds

### BM25 Ranking Lab

See why rare words spike, repeats saturate, and long docs get checked. Type a query, tune `k1` and `b`, and inspect each document’s score contribution term by term.

| What you'll learn | Time |
|---|---|
| Why rare query terms create more score than common ones | 6-9 min |
| How repeated matches help, but not linearly forever | |
| How document length changes the denominator and the final ranking | |

**Concepts covered:** Inverse document frequency, Term saturation, Length normalization, Ranking

### Monte Carlo Tree Search

Watch exploration and exploitation negotiate in public. A starship crew explores unknown regions while the MCTS algorithm learns which paths yield the best rewards.

| What you'll learn | Time |
|---|---|
| How UCT balances popular vs. uncertain branches | 8-12 min |
| What expansion, rollout, and backpropagation each contribute | |
| Why the best move emerges only after repeated simulations | |

**Concepts covered:** Selection, UCT, Rollouts, Backpropagation

## 🗺️ Upcoming Modules

| Module | Description |
|--------|-------------|
| **Attention Maps** | Trace how tokens compete for influence and why context can suddenly dominate a generation |
| **Q-Learning Arcade** | Watch value estimates form over repeated trials and see the effect of exploration schedules |
| **Diffusion Studio** | Scrub through denoising steps to understand why images sharpen gradually |

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/tsilva/aigrounds.git
cd aigrounds

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and jump into the BM25 or MCTS lab.

## 🔎 Analytics

Google Analytics 4 support is enabled automatically when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.

For local development, add it to `.env.local`:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

The app loads `gtag.js` only when that variable is present and sends page views for App Router navigations.

## 🏗️ Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Homepage with playground catalog
│   └── playgrounds/[slug]/    # Dynamic playground routes
├── components/
│   └── playground-shell.tsx    # Shared shell for all modules
├── lib/
│   └── playgrounds.ts         # Playground registry & metadata
└── modules/
    ├── bm25/                   # BM25 ranking lab
    │   ├── Bm25Playground.tsx  # Interactive retrieval UI
    │   ├── bm25-engine.ts      # BM25 scoring implementation
    │   └── corpus.ts           # Search corpus and preset queries
    └── mcts/                   # Monte Carlo Tree Search
        ├── MctsPlayground.tsx  # Interactive visualization
        ├── mcts-engine.ts     # Core algorithm implementation
        └── scenario.ts        # Mission tree & game state
```

Each module lives in its own folder under `modules/` with its component, engine, and data — making new playgrounds easy to add without touching existing code.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, static generation) |
| UI | React 19 + TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Fonts | Space Grotesk + IBM Plex Mono |
| Deployment | Vercel (static + client-side) |

## 🤝 Contributing

Want to add a new AI playground? Each module follows a simple pattern:

1. Create a folder under `src/modules/` with your component, engine, and data
2. Register it in `src/lib/playgrounds.ts`
3. The routing and shell are handled automatically

## ⭐ Star Us

If this helped you understand an AI concept, [give us a star](https://github.com/tsilva/aigrounds) — it helps others find these playgrounds too.

## License

MIT

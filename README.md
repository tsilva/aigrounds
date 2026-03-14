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
- **Attention heatmaps** — track which earlier tokens are winning the decoding step
- **Policy learning diagnostics** — watch Q-values, visit counts, and greedy routes update after each episode
- **Ranking diagnostics** — inspect BM25 term contributions, IDF, and length normalization side by side
- **Diffusion step scrubber** — compare milestone denoising frames and see why sharpness arrives late
- **Modular architecture** — each AI concept is a self-contained playground, easy to extend
- **Zero backend** — everything runs client-side, no API keys or servers needed

## 🧪 Available Playgrounds

### Attention Maps

Trace how tokens compete for influence and why one earlier cue can suddenly take the whole step. Blend between recent phrasing and long-range context, then watch attention weights and next-token predictions flip in public.

| What you'll learn | Time |
|---|---|
| How a small query shift can cause one token to absorb most of the attention mass | 7-10 min |
| Why recent tokens often win by default until a stronger contextual cue appears | |
| How the weighted context vector changes the final next-token ranking | |

**Concepts covered:** Query-key similarity, Softmax competition, Recency bias, Next-token decoding

### BM25 Ranking Lab

See why rare words spike, repeats saturate, and long docs get checked. Type a query, tune `k1` and `b`, and inspect each document’s score contribution term by term.

| What you'll learn | Time |
|---|---|
| Why rare query terms create more score than common ones | 6-9 min |
| How repeated matches help, but not linearly forever | |
| How document length changes the denominator and the final ranking | |

**Concepts covered:** Inverse document frequency, Term saturation, Length normalization, Ranking

### Q-Learning Arcade

Watch a policy emerge from raw trial, error, and changing curiosity. Run episodes on a small arcade floor, inspect directional Q-values for each state, and compare epsilon schedules as the learner decides between a safe cashout and a harder jackpot route.

| What you'll learn | Time |
|---|---|
| How rewards propagate backward through temporal-difference updates | 7-10 min |
| How epsilon schedules affect whether the agent keeps exploring | |
| How a greedy policy sharpens after repeated episodes | |

**Concepts covered:** Temporal-difference updates, Epsilon-greedy exploration, Discounting, Policy improvement

### Diffusion Studio

Scrub through denoising steps to understand why images sharpen gradually rather than appear all at once. Compare milestone frames to see composition settle early while edges and texture arrive in later passes.

| What you'll learn | Time |
|---|---|
| Why broad composition appears before crisp edges and texture | 7-10 min |
| How iterative denoising removes uncertainty step by step | |
| Why late diffusion steps mostly polish rather than redraw the scene | |

**Concepts covered:** Denoising loop, Noise schedules, Low vs high frequencies, Latent refinement

### Monte Carlo Tree Search

Watch exploration and exploitation negotiate in public. A starship crew explores unknown regions while the MCTS algorithm learns which paths yield the best rewards.

| What you'll learn | Time |
|---|---|
| How UCT balances popular vs. uncertain branches | 8-12 min |
| What expansion, rollout, and backpropagation each contribute | |
| Why the best move emerges only after repeated simulations | |

**Concepts covered:** Selection, UCT, Rollouts, Backpropagation

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

Open [http://localhost:3000](http://localhost:3000) and jump into the Attention, BM25, Q-learning, Diffusion Studio, or MCTS lab.

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
    ├── attention/              # Attention maps lab
    │   ├── AttentionPlayground.tsx
    │   ├── attention-engine.ts
    │   └── scenarios.ts
    ├── bm25/                   # BM25 ranking lab
    │   ├── Bm25Playground.tsx  # Interactive retrieval UI
    │   ├── bm25-engine.ts      # BM25 scoring implementation
    │   └── corpus.ts           # Search corpus and preset queries
    ├── q-learning/             # Q-learning arcade
    │   ├── QLearningPlayground.tsx
    │   ├── arcade.ts           # Gridworld map and state metadata
    │   └── q-learning-engine.ts
    ├── diffusion/              # Diffusion Studio
    │   ├── DiffusionPlayground.tsx
    │   ├── diffusion-engine.ts # Denoising frame generator
    │   └── subjects.ts         # Preset scenes for scrubbing
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

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Grounds is an interactive educational web app for learning AI concepts through hands-on playgrounds. Users explore algorithms by interacting with visualizations rather than reading theory. Currently features a Monte Carlo Tree Search (MCTS) module.

## Commands

- `npm run dev` — start dev server (localhost:3000)
- `npm run build` — production build (also validates TypeScript and ESLint)
- `npm run lint` — run ESLint
- `npm run start` — serve production build locally

No test framework is configured yet.

## Architecture

### Module System

Each AI playground is a self-contained module under `src/modules/{name}/`. A module typically contains:
- A React component (`{Name}Playground.tsx`) — interactive UI
- An engine file (`{name}-engine.ts`) — pure-functional algorithm implementation
- A scenario/data file — domain-specific data structures

Modules are registered in `src/lib/playgrounds.ts` which serves as the central registry. Adding a new module requires:
1. Creating the module folder under `src/modules/`
2. Adding an entry to `activePlaygrounds` in `src/lib/playgrounds.ts`
3. Routing is automatic via the `[slug]` dynamic route

### Key Paths

- `src/app/` — Next.js App Router (layout, pages, global styles)
- `src/app/playgrounds/[slug]/page.tsx` — dynamic route that resolves modules by slug
- `src/components/playground-shell.tsx` — shared wrapper providing consistent header, breadcrumb, learning goals
- `src/lib/playgrounds.ts` — playground registry, types (`ActivePlayground`, `UpcomingPlayground`, `Theme`)
- `src/modules/mcts/` — MCTS module (engine is pure-functional, scenario defines a starship decision tree)

### Tech Stack

- Next.js 16 with App Router, React 19, TypeScript 5 (strict mode)
- Tailwind CSS 4 with PostCSS
- Fonts: Space Grotesk (headings), IBM Plex Mono (code/stats)
- Path alias: `@/*` → `./src/*`
- Deployed on Vercel (static + client-side, no server API)

## Conventions

- Algorithm engines should be pure-functional (no mutations) for testability and traceability
- Each module is fully self-contained — shared code lives in `src/components/` or `src/lib/`
- README.md must be kept up to date with any significant project changes

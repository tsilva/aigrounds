# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Grounds is an interactive educational web app for learning AI concepts through hands-on playgrounds. Users explore algorithms by interacting with visualizations rather than reading theory. Current modules cover statistics, probability, loss functions, optimization, model evaluation, and generalization.

## Commands

- `pnpm dev` — start dev server (localhost:3000)
- `pnpm build` — production build (also validates TypeScript and ESLint)
- `pnpm lint` — run ESLint
- `pnpm check:cycles` — verify local imports are acyclic
- `pnpm start` — serve production build locally

No test framework is configured yet.

## Architecture

### Module System

Each AI playground is a self-contained module under `src/modules/{name}/`. A module typically contains:
- A React component (`{Name}Playground.tsx`) — interactive UI
- An engine file (`{name}-engine.ts`) — pure-functional algorithm implementation
- A scenario/data file — domain-specific data structures

Modules are described in `src/lib/playground-metadata.ts` and wired to components in `src/lib/playgrounds.ts`. The home dashboard is the canonical current and future lesson plan: `activePlaygroundMetadata` holds live lessons, `upcomingPlaygrounds` holds planned lesson cards, and `dashboardLessonPlanOrder` controls their combined order. Adding a new live module requires:
1. Creating the module folder under `src/modules/`
2. Adding metadata to `activePlaygroundMetadata` in `src/lib/playground-metadata.ts`
3. Adding the component to `playgroundComponents` in `src/lib/playgrounds.ts`
4. Placing the slug in `dashboardLessonPlanOrder`
5. Routing is automatic via the `[slug]` dynamic route

### Key Paths

- `src/app/` — Next.js App Router (layout, pages, global styles)
- `src/app/playgrounds/[slug]/page.tsx` — dynamic route that resolves modules by slug
- `src/lib/playground-metadata.ts` — canonical dashboard lesson plan, playground metadata, tags, and learning goals
- `src/lib/playgrounds.ts` — slug-to-component registry and `ActivePlayground` type
- `src/app/api/chat/route.ts` — OpenRouter-backed playground assistant API route

### Tech Stack

- Next.js 16 with App Router, React 19, TypeScript 5 (strict mode)
- Tailwind CSS 4 with PostCSS
- Fonts: Space Grotesk (headings), IBM Plex Mono (code/stats)
- Path alias: `@/*` → `./src/*`
- Deployed on Vercel (client-side playgrounds plus a server API route for chat)

## Conventions

- Algorithm engines should be pure-functional (no mutations) for testability and traceability
- Each module is fully self-contained — shared code lives in `src/components/` or `src/lib/`
- README.md must be kept up to date with any significant project changes

## Product Specifications

Before any task in this repository, use the `$specs-author` skill to read the root `SPECS.md`. Use `$specs-author` whenever reading or writing `SPECS.md`.

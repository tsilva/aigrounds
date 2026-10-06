# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Grounds is an interactive educational web app for learning AI concepts through hands-on playgrounds. Users explore algorithms by interacting with visualizations rather than reading theory. Current modules cover statistics, probability, loss functions, optimization, model evaluation, and generalization.

## Commands

- `pnpm dev --port auto` — start a dev server on an available port
- `pnpm build` — production build (also validates TypeScript)
- `pnpm typecheck` — standalone TypeScript check
- `pnpm lint` — run ESLint
- `pnpm check:cycles` — verify local imports are acyclic
- `pnpm start` — serve production build locally

No test framework is configured yet.

After application changes, run `pnpm typecheck`, `pnpm lint`, `pnpm check:cycles`, and `pnpm build`. For instruction-only changes, validate skill metadata, reference paths, and the Git diff instead.

## Browser and Server Verification

Reuse an existing development server. Otherwise run `pnpm dev --port auto` and report its printed URL. Never kill or restart an existing server; if startup or automatic port selection fails, stop and warn instead of choosing a fixed port.

Use the native Codex Desktop in-app Browser for rendered checks. Load its bundled Browser skill/runtime, initialize `browser-client`, select `agent.browsers.get("iab")`, and use documented Playwright/CUA APIs. Follow its recovery guidance before falling back to another browser surface.

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

Before every task in this repository, use the `$specs-author` skill to read the entire root `SPECS.md`. Before finishing, reread it and check the task and conversation for new or changed stakeholder intent.

- Treat `SPECS.md` as the persistent source of stakeholder requirements that cannot be inferred reliably from code or remembered conversations.
- Apply the scope test to proposed and existing requirements: root `SPECS.md` contains only project-wide intent; scoped intent belongs in its nearest authoritative specification and must not be broadened to fit the root.
- If the task, repository, or user request contradicts, omits, or ambiguously interprets the specification, tell the user. Continue safe exploration and work that does not depend on resolving the issue, but never silently choose an interpretation.
- Never edit `SPECS.md` from inference. Propose the exact change, explain why it reflects stakeholder intent, and edit the file only after the user explicitly approves that exact change.
- Keep `SPECS.md` complete, concise, and compacted. It must contain stakeholder intent rather than implementation, architecture, operations, or transient project detail.

## Learning Page Workflows

Use `$aigrounds-lesson` at `.codex/skills/aigrounds-lesson/SKILL.md` for creating, auditing, fixing, optimizing, or redesigning an individual playground and its AI Guide. Its Redesign mode handles migrations of older lessons to the shared scheme. Use `$aigrounds-curriculum` at `.codex/skills/aigrounds-curriculum/SKILL.md` for cross-lesson sequencing, live/planned reconciliation, prerequisite gaps, and lesson splits or merges.

## Learning Page Design System

Before creating a playground or materially redesigning one, read `DESIGN_SYSTEM.md`, the canonical scheme backed by `src/components/learning-page/`. Apply its component, layout metadata, and Guide-placement rules through the lesson skill; older mockups are historical when they conflict with this scheme.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Secrets

`pnpm dev --port auto` fetches only the linked Infisical development project through the saved human CLI login. Private keys must remain out of dotenv files, command arguments, logs, and browser bundles. Use `pnpm secrets:check` for presence-only verification and `pnpm secrets:migrate` for manifest-bound Keychain migration. Production uses the separate `aigrounds-production` project and its Vercel Production sync. Do not inject production credentials into local development.

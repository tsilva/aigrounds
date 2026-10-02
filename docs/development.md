# Development

AI Grounds uses Next.js 16 with the App Router, React 19, strict TypeScript, and Tailwind CSS 4. Fonts are Space Grotesk for headings and IBM Plex Mono for formulas and code. Vercel serves the app and its chat API.

## Local checks

Use Node.js 24, matching CI, and pnpm 10.27.0, pinned in `package.json`. The repository enforces pnpm during installation. If Corepack is installed, `corepack enable` can activate pnpm.

After application changes, run:

```bash
pnpm typecheck
pnpm lint
pnpm check:cycles
pnpm build
```

`pnpm test:deps` exercises patched dependency security boundaries. There is no general-purpose test framework. CI also runs a dependency audit after a frozen-lockfile install with lifecycle scripts disabled.

Reuse an existing development server. Otherwise, run `pnpm dev --port auto` and open its printed URL. Do not kill or restart an existing server; report startup or automatic port-selection failures instead.

## Lessons and shared controls

Guided-discovery lessons use the shared [learning-page design system](../DESIGN_SYSTEM.md): a continuous white workbench, lavender experiment rail, matching scenario controls and summaries, and an AI Guide CTA below the exercise. The reusable shell includes scenario/reset controls, exact-value editing, accessible experiment choices and feedback, and pointer/keyboard number-line controls. New lessons and material redesigns compose these components from `src/components/learning-page/`, keeping mathematical visuals and experiment logic in each module.

Project-local Codex workflows are [aigrounds-lesson](../.codex/skills/aigrounds-lesson/SKILL.md) for creating, auditing, fixing, optimizing, or redesigning one lesson and [aigrounds-curriculum](../.codex/skills/aigrounds-curriculum/SKILL.md) for sequencing, prerequisites, and live/planned reconciliation. Detailed lesson protocols are loaded only for the selected mode.

The home dashboard is the canonical current and future lesson plan. `activePlaygroundMetadata` holds published lessons, `upcomingPlaygrounds` holds planned lessons, and `dashboardLessonPlanOrder` controls their combined order.

To add a published lesson, create its self-contained module under `src/modules/`, add its metadata, register its component in `src/lib/playgrounds.ts`, and place its slug in the dashboard order. The dynamic playground route resolves registered slugs automatically; sitemap entries come from published metadata. Keep algorithm engines pure-functional and concept-specific logic inside each module.

The gallery opens in curriculum order. Use the sort buttons to switch to newest updates first; search works in either view, and planned lessons follow published lessons when sorting by update date. Published cards show the date of the latest committed change in their module. `pnpm dev` and `pnpm build` refresh `src/lib/playground-updates.json` from Git history, retaining saved dates when history is missing or shallow. Commit the refreshed dates alongside lesson updates so builds without Git history can display them.

Read [SPECS.md](../SPECS.md) and [AGENTS.md](../AGENTS.md) before repository work. Follow the [learning-page design system](../DESIGN_SYSTEM.md) for new lessons and material redesigns.

## Branding

The indigo learning-blocks branding includes a README logo at `logo.png`, transparent source artwork in `public/brand/sources/`, and web icons, favicons, and an Open Graph image in `public/brand/web-seo/`. The app metadata already uses these web assets. `public/brand/manifest.json` records the current export dimensions; generation prompts are saved with the sources. Older store graphics are retained separately and are not part of the current web asset pack.

See the [asset inventory](../public/brand/manifest.json) and [generation prompts](../public/brand/sources/prompts.md).

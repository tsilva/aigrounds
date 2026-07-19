---
name: aigrounds-lesson-plan-review
description: Use when reviewing, optimizing, or reconciling the AI Grounds dashboard lesson plan, including checking live-vs-planned status, adding implemented lessons missing from the dashboard, reordering lessons into the smoothest learning sequence, adding missing prerequisite lessons, and breaking oversized lessons into smaller playground-sized steps.
---

# AI Grounds Lesson Plan Review

Use this skill to make the home dashboard the canonical lesson plan for both
live and planned lessons.

## Source Files

- Dashboard lesson plan: `src/lib/playground-metadata.ts`
- Implemented lesson metadata: `activePlaygroundMetadata`
- Planned lesson metadata: `upcomingPlaygrounds`
- Dashboard order: `dashboardLessonPlanOrder`
- Implemented lesson registry: `src/lib/playgrounds.ts`
- Home ordering surface: `src/app/page.tsx`
- Home card renderer: `src/app/home-page.tsx`
- Lesson modules: `src/modules/*`
- Tutor plans, when present: `src/lib/tutor-plans.ts`

Treat the rendered home dashboard and its metadata as the planning source of
truth, but verify live status against the app before trusting metadata alone.

## Workflow

1. Inventory the app.
   - Read `src/lib/playground-metadata.ts`, `src/lib/playgrounds.ts`, and
     `src/app/page.tsx`.
   - Enumerate implemented lessons from `activePlaygroundMetadata`,
     `playgroundComponents`, and `src/modules/*/*Playground.tsx`.
   - A lesson counts as implemented only when it has reachable metadata, a
     registered component, and a module component. If one of those is missing,
     treat it as planned or incomplete, not live.
   - Use metadata titles as the canonical titles for implemented lessons.

2. Reconcile live and planned state.
   - If a lesson is in `activePlaygroundMetadata` but is not implemented and
     reachable, move it to `upcomingPlaygrounds` or complete the missing wiring.
   - If a lesson is implemented and reachable but only appears in
     `upcomingPlaygrounds`, move it to `activePlaygroundMetadata` and register
     the component.
   - If an implemented lesson is missing from `dashboardLessonPlanOrder`, add
     its slug in the best learning position.
   - Preserve user lesson-plan intent when merging duplicates. Prefer one
     canonical dashboard card over repeated entries.

3. Optimize the learning sequence.
   - Sort for prerequisite flow, not implementation chronology.
   - Prefer this broad progression unless repo context clearly argues otherwise:
     descriptive statistics, probability counting, conditional probability and
     Bayes, discrete distributions, continuous distributions, sampling,
     statistical inference, relationships and regression, evaluation and
     generalization, feature scaling and distance, vector geometry and
     retrieval, loss functions, optimization, regularization, unsupervised
     learning, neural networks, attention and transformers.
   - Keep adjacent lessons connected by one clear dependency. Avoid introducing
     terms such as likelihood, calibration, residuals, gradients, embeddings, or
     attention before a prior lesson gives the needed intuition.
   - Interleave already implemented advanced lessons into their correct learning
     location; do not leave them in a separate ideas section if the dashboard is
     meant to be a single learner sequence.

4. Fill learning gaps.
   - Scan each transition and ask: "What would a learner need to know before
     this lesson makes sense?"
   - Add missing prerequisite lessons when a concept appears without support.
   - Split any lesson that tries to teach multiple primary intuitions or would
     need multiple unrelated interactions. Each item should remain one
     playground-sized chunk: one core intuition, one primary visual interaction,
     and a focused set of concepts.
   - Keep new items concise and actionable: slug, title, tag, concepts, and one
     short summary of what the playground teaches and how it teaches it.

5. Update the dashboard order.
   - Ensure the home dashboard appears in the same top-to-bottom order as the
     canonical `dashboardLessonPlanOrder`.
   - Keep every live lesson in `activePlaygroundMetadata`, every planned lesson
     in `upcomingPlaygrounds`, and every displayed slug in
     `dashboardLessonPlanOrder`.
   - If live and planned lessons should be interleaved, update
     `dashboardLessonPlanOrder` so the dashboard renders that unified order.
   - Keep `src/app/home-page.tsx` unchanged unless the rendering component itself
     must change; the ordering should usually come from metadata and page
     assembly.

6. Verify.
   - Run `pnpm lint` and `pnpm build` after code changes.
   - Reuse an existing development server if dashboard code changed. Otherwise
     run `pnpm dev --port auto`, report its printed URL, and never kill or
     restart an existing server. Stop and warn if automatic port selection or
     startup fails.
   - Load the bundled Browser skill/runtime, initialize `browser-client`, select
     `agent.browsers.get("iab")`, and use its documented Playwright/CUA APIs to
     inspect `/` and confirm the visible card order matches
     `dashboardLessonPlanOrder`.
   - Report any skipped verification command and why it was skipped.

## Ordering Heuristics

- Earlier lessons should reduce cognitive load for later lessons.
- Do not mark a lesson done because related concepts appear inside another
  lesson. Mark it done only if the promised standalone playground exists.
- Avoid broad catch-all lessons. For example, split a lesson if it combines
  distribution mechanics, sampling behavior, and inference decisions.
- Add bridge lessons when a later module depends on vocabulary that is not yet
  taught directly.
- Keep titles stable when they match implemented metadata; changing a title
  should be intentional and reflected in metadata and dashboard cards.

## Final Response

Summarize:

- live/planned status corrections,
- lessons added or split,
- ordering changes,
- dashboard files changed,
- verification performed.

If the review finds a significant lesson-plan judgment call, state the chosen
assumption briefly instead of leaving the lesson plan ambiguous.
